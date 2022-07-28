export class UserAccount {
    username!: string;
    name!: string;
    created!: string;
    lastAccess?: string;
    resetRequest!: boolean;
    active!: boolean;
    userRole!: number;
}

export class UserInfo {
    username?: string;
    name?: string;
    userRole?: number;
}

export class Binnacle {
  action!: string;
  object?: string;
  actionDate!: string;
}

export class Employee {
  exp?: number;
  name?: string;
  cveAdscripcion?: string;
  adscripcion?: string;
}

export function search(row: any, value: string): boolean {
  return Object.keys(row).some(key => {
      if (typeof row[key] === 'string' || typeof row[key] === 'number') {
        value = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const rowVal = row[key].toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return rowVal.indexOf(value) > -1;
      } else if (row[key] && typeof row[key] === 'object') {
        return search(row[key], value);
      }
      return false;
  });
}

export const PasswordRegex: RegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]+$/);

export function compare(a: number | string | Date, b: number | string | Date, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}