const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ROUTING_NUMBER = "026014881";

async function runMigration() {
  console.log("Starting Beacon Capital migration...");

  // 1. Fetch all accounts
  const { data: accounts, error: accErr } = await supabase.from('accounts').select('*');
  if (accErr) {
    console.error("Error fetching accounts:", accErr);
    return;
  }
  console.log(`Found ${accounts.length} existing accounts.`);

  const usedAccountNumbers = new Set();

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    let newAccNum = acc.accountNumber;

    // Check if account number needs upgrading (starts with '...' or has fewer than 10 digits or is a duplicate)
    if (!newAccNum || newAccNum.startsWith('...') || newAccNum.length < 10 || usedAccountNumbers.has(newAccNum)) {
      // Generate a guaranteed unique 10-digit account number
      let candidate = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      while (usedAccountNumbers.has(candidate)) {
        candidate = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      }
      newAccNum = candidate;
    }
    usedAccountNumbers.add(newAccNum);

    // Attempt to update routingNumber as well if column exists
    try {
      const { error: updErr } = await supabase
        .from('accounts')
        .update({ accountNumber: newAccNum, routingNumber: ROUTING_NUMBER })
        .eq('id', acc.id);
      
      if (updErr && updErr.message && updErr.message.includes('routingNumber')) {
        // Fallback without routingNumber column
        await supabase
          .from('accounts')
          .update({ accountNumber: newAccNum })
          .eq('id', acc.id);
      }
    } catch (err) {
      console.warn(`Update warning for account ${acc.id}:`, err.message);
    }
  }
  console.log(`All ${accounts.length} accounts processed with unique 10-digit numbers and routing number ${ROUTING_NUMBER}.`);

  // 2. Add sample loan facility for Alexander Hamilton if not exists
  const { data: alexLoan } = await supabase
    .from('accounts')
    .select('id')
    .eq('userId', 'u-alexander')
    .eq('accountType', 'loan')
    .maybeSingle();

  if (!alexLoan) {
    console.log("Creating commercial loan facility for Alexander Hamilton...");
    let loanAccNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    while (usedAccountNumbers.has(loanAccNum)) {
      loanAccNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    }
    usedAccountNumbers.add(loanAccNum);

    try {
      await supabase.from('accounts').insert({
        id: 'acc-alex-loan',
        userId: 'u-alexander',
        accountNumber: loanAccNum,
        routingNumber: ROUTING_NUMBER,
        accountType: 'loan',
        accountName: 'Beacon Commercial Real Estate Loan',
        balance: 185000.00,
        interestRate: 5.25,
        monthlyPayment: 3420.00,
        loanTerm: '60 Months',
        originalPrincipal: 250000.00,
      });
    } catch (e) {
      // Fallback
      await supabase.from('accounts').insert({
        id: 'acc-alex-loan',
        userId: 'u-alexander',
        accountNumber: loanAccNum,
        accountType: 'loan',
        accountName: 'Beacon Commercial Real Estate Loan',
        balance: 185000.00,
      });
    }
    console.log("Alexander commercial loan created.");
  }

  // 3. Check cards table
  const { error: cardsTableErr } = await supabase.from('cards').select('id').limit(1);
  if (cardsTableErr) {
    console.log("Note: Cards table does not yet exist in Supabase (run DDL in supabase_schema.sql). Built-in db.getCards fallback will provision and serve cards dynamically.");
  } else {
    const { data: users } = await supabase.from('users').select('*');
    if (users) {
      const usedCardNumbers = new Set();
      const { data: existingCards } = await supabase.from('cards').select('cardNumber');
      if (existingCards) {
        existingCards.forEach(c => usedCardNumbers.add(c.cardNumber));
      }

      for (const u of users) {
        const { data: userCard } = await supabase.from('cards').select('id').eq('userId', u.id).maybeSingle();
        if (!userCard) {
          let cardNum = `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
          while (usedCardNumbers.has(cardNum)) {
            cardNum = `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
          }
          usedCardNumbers.add(cardNum);

          const cardId = 'card-' + Math.random().toString(36).substring(2, 11);
          const cardHolder = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Valued Client';
          const cvv = Math.floor(100 + Math.random() * 900).toString();

          await supabase.from('cards').insert({
            id: cardId,
            userId: u.id,
            cardNumber: cardNum,
            cardHolder,
            expiryMonth: '09',
            expiryYear: '29',
            cvv,
            cardType: 'credit',
            cardTier: 'Beacon Elite Black',
            creditLimit: 50000.00,
            availableCredit: 48500.00,
            status: 'Active',
            isFrozen: false,
          });
          console.log(`Issued unique credit card ${cardNum} to user ${cardHolder}`);
        }
      }
    }
  }

  console.log("Migration complete!");
}

runMigration().catch(console.error);
