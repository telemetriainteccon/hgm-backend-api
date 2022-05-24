export interface reportMmaDto {
  date: string;
  m: {
    min: string | number;
    max: string | number;
    mean: string | number;
  };
  t: {
    min: string | number;
    max: string | number;
    mean: string | number;
  };
}
