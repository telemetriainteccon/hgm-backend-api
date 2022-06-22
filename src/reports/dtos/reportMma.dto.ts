export interface reportMmaDto {
  date: string;
  f: {
    timeMin: string | string;
    min: string | number;
    timeMax: string | string;
    max: string | number;
    timeMean: string | string;
    mean: string | number;
  };
  m: {
    timeMin: string | string;
    min: string | number;
    timeMax: string | string;
    max: string | number;
    timeMean: string | string;
    mean: string | number;
  };
  t: {
    timeMin: string | string;
    min: string | number;
    timeMax: string | string;
    max: string | number;
    timeMean: string | string;
    mean: string | number;
  };
}
