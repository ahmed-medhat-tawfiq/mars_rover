import { Direction } from './rover.enums';
import { IPosition } from './rover.interfaces';

export class RoverService {
  private position?: IPosition;
  private readonly maxCommandLength: number;
  private readonly directions: Direction[];
  private readonly obstacles: Set<string>;

  constructor() {
    this.maxCommandLength = 9;
    this.directions = [Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST];
    this.obstacles = new Set(['1,4', '3,5', '7,4']);
  }

  create(position: IPosition) {
  }

  move(commands: string): IPosition {
    throw Error('move function not implemented yet');
  }

  getCommand(): string {
    throw Error('getCommand function not implemented yet');
  }

}