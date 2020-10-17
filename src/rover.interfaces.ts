import { Axis, Direction } from './rover.enums';

export interface ICoordinates {
  x_axis: number;
  y_axis: number;
}

export interface IPosition extends ICoordinates {
  direction: Direction; 
}

export interface IOneMovementStep {
  position: IPosition;
  command: string
}

export interface IClosedPositions {
  forwardPosition: IPosition; 
  rightPosition: IPosition; 
  leftPosition: IPosition;
  backwardPosition: IPosition;
}

export interface IAxisesSlopes {
  verticalAxis: Axis;
  horizontalAxis: Axis;
}