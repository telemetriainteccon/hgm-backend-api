export interface reportMmaDto {
  date: string;
  m: {
    min: number;
    max: number;
    mean: number;
  };
  t: {
    min: number;
    max: number;
    mean: number;
  };
}
