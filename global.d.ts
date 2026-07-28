/** biome-ignore-all lint/correctness/noUnusedVariables: types in *.d.ts are automatically picked up without exporting. */
declare module "*" {
  const content: string;
  export default content;
}

declare function getTokenCard(
  public_key: string,
  data_card: {
    name: string;
    document: string;
    customer_id?: string;
    number: string;
    cvv: string;
    month: string;
    year: string;
  },
  installments: number,
  callback: (data: {
    token: string;
    brand: string;
    bin: string;
    msgError?: string;
  }) => void
): void;
