export class Table {
    idTable?: number;
    idCat?: number;
    category?: string;
    tableTxt?: string;
    description?: string;
    registro?: string;
}

export class GroupTables {
    category?: string;
    tables: Array<Table> = [];
}