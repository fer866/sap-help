export class Transaction {
    idTransaction?: number;
    idCat?: number;
    category?: string;
    transactionTxt?: string;
    description?: string;
    alta?: string;
}

export class GroupTransactions {
    category?: string;
    transactions: Array<Transaction> = [];
}