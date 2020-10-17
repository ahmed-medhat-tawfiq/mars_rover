import { Direction } from './rover.enums';

export interface ICoordinates {
  x_axis: number;
  y_axis: number;
}

export interface IPosition extends ICoordinates {
  direction: Direction; 
}
