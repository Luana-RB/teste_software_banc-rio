export class CreateClientDto {
  name: string;
  age: number;
  email: string;
  active: boolean;
  idAccount: number;
}

export type Client = {
  id: number;
  name: string;
  age: number;
  email: string;
  active: boolean;
  idAccount: number;
};
