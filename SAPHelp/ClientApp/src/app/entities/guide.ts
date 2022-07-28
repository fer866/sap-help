export class Guide {
    idGuide?: number;
    idCat?: number;
    category?: string;
    title?: string;
    alta?: string;
    views?: number;
    lastView?: string;
    tags?: string;
}

export class GroupGuides {
    category?: string;
    guides: Array<Guide> = [];
}

export class Step {
    idStep?: number;
    idGuide?: number;
    transactionTxt?: string;
    stepTxt?: string;
    fileUrl?: string;
    position?: number;
    isImage?: boolean;
}

export class PhotoProps {
    x?: number;
    y?: number;
    step?: Step;
}