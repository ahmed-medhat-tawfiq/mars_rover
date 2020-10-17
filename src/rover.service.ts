import { Axis, Command, Direction } from './rover.enums';
import { IClosedPositions, IOneMovementStep, IPosition, IAxisesSlopes } from './rover.interfaces';

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
    this.position = position;
  }

  /* Validate command to check if there is not collection then move rover to the final position */
  move(commands: string): IPosition {

    if (this.position) {
      const newPosition: IPosition = { ...this.position };
      let currentDirectionIndex = this.directions.indexOf(this.position.direction);

      for (const cmd of commands) {
        switch (cmd) {
          case Command.Right:
          case Command.Left:
            currentDirectionIndex = this.rotate(currentDirectionIndex, cmd);
            newPosition.direction = this.directions[currentDirectionIndex];
            break;

          case Command.Forward:
          case Command.Backward:
            const { verticalAxis } = this.getAxisesSlopes(currentDirectionIndex);

            newPosition[verticalAxis] = this.incrementAxisValue(cmd, currentDirectionIndex, newPosition[verticalAxis]);

            this.stopForCollision(newPosition);
            break;
        
          default:
            throw Error(`Invalid Command ${cmd} in ${commands}`);
        }
      }

      this.position = newPosition;

      return newPosition;
    }
    else {
      throw Error('Rover not created to move');
    }
  }

  getCommand(): string {
    if (this.position) {
      let currentCommand = '';
      let currentPosition: IPosition = this.position;
      let closedPositions = this.getClosedPositions(currentPosition);
      const isRoverCanMove = this.canMove(closedPositions);

      if (!isRoverCanMove) throw Error('Rover is surrounded with obstacles');

      while (currentCommand.length < this.maxCommandLength) {
        const { command, position } = this.moveCommandOneStep(currentPosition, closedPositions, currentCommand);

        currentCommand = command;
        currentPosition = position;
        closedPositions = this.getClosedPositions(currentPosition);
      }

      return currentCommand
    }
    else {
      throw Error('Rover not created to move');
    }
  }

  //TODO: change func name
  private moveCommandOneStep(currentPosition: IPosition, closedPositions: IClosedPositions, currentCommand: string): IOneMovementStep {
    const { forwardPosition, leftPosition, rightPosition } = closedPositions;
    let newCommand: Command;

    if (!this.isObstacle(forwardPosition) && !this.isCave(forwardPosition)) {
      return { command: `${currentCommand}F`, position: forwardPosition };
    }
    else if (!this.isObstacle(leftPosition) && !this.isCave(leftPosition)) {
      newCommand = Command.Left;
    }
    else if (!this.isObstacle(rightPosition) && !this.isCave(rightPosition)) {
      newCommand = Command.Right;
    }
    else {
      newCommand = Command.Left;
    }
    
    let currentDirectionIndex = this.directions.indexOf(currentPosition.direction);
    currentDirectionIndex = this.rotate(currentDirectionIndex, newCommand);
    const direction = this.directions[currentDirectionIndex];

    return { command: `${currentCommand}${newCommand}`, position: { ...currentPosition, direction } };
  }


  /* Rotate to Right [Clock Wise] or to Left [Anti Clock Wise] and Return the Index of Direction in Directions array*/
  private rotate(currentDirectionIndex: number, command: Command): number {
    const newDirectionIndex = command === Command.Right ? 
      (currentDirectionIndex + 1) % this.directions.length : (currentDirectionIndex === 0 ? this.directions.length : currentDirectionIndex) - 1;
    
    return newDirectionIndex;
  }

  private stopForCollision(newPosition: IPosition) {
    const currentPosition = <IPosition> this.position;
    const positionIsObstacle = this.isObstacle(newPosition);

    if (positionIsObstacle) {
      throw new Error(`(${currentPosition.x_axis}, ${currentPosition.y_axis}) ${currentPosition.direction} STOPPED`);
    }
  }

  /* Get The 4 Surrounded/Closed Points to Rover */
  private getClosedPositions(position: IPosition): IClosedPositions {
    const currentDirectionIndex = this.directions.indexOf(position.direction);
    const { horizontalAxis, verticalAxis } = this.getAxisesSlopes(currentDirectionIndex);

    const rotateToRightIndex = this.rotate(currentDirectionIndex, Command.Right);
    const rotateToLeftIndex = this.rotate(currentDirectionIndex, Command.Left);
    const rotateToBackwardIndex = this.rotate(rotateToRightIndex, Command.Right);

    const forwardPosition: IPosition = {...position, [verticalAxis]: this.incrementAxisValue(Command.Forward, currentDirectionIndex, position[verticalAxis]) };
    const rightPosition: IPosition = { 
      ...position, direction: this.directions[rotateToRightIndex], 
      [horizontalAxis]: this.incrementAxisValue(Command.Forward, rotateToRightIndex, position[horizontalAxis])
    };
    const leftPosition: IPosition = { 
      ...position, direction: this.directions[rotateToLeftIndex],
      [horizontalAxis]: this.incrementAxisValue(Command.Forward, rotateToLeftIndex, position[horizontalAxis])
    };
    const backwardPosition: IPosition = {
      ...position, direction: this.directions[rotateToBackwardIndex],
      [verticalAxis]: this.incrementAxisValue(Command.Forward, rotateToBackwardIndex, position[verticalAxis])
    };

    return { forwardPosition, backwardPosition, leftPosition, rightPosition };
  }

  /* Increment Or Decrement Y or X point depends on Command [Forward or Backward] & Rover position [Negative or Positive] Side in X-Y axis*/
  private incrementAxisValue(command: Command, currentDirectionIndex: number, axisValue: number) {
    let incrementBy = command === Command.Forward ? 1 : -1;

    /* if currentDirectionIndex bigger than 1 that's mean [South or West] so the forward value should incremented by -1*/
    incrementBy *= currentDirectionIndex > 1 ? -1 : 1; 

    const newAxisValue = axisValue + incrementBy;

    return newAxisValue;
  }

  private isObstacle(position: IPosition): boolean {
    const positionIsObstacle = this.obstacles.has(`${position.x_axis},${position.y_axis}`);

    return positionIsObstacle;
  }

  /*  Check https://drive.google.com/file/d/1bcVDtc0COSt40wdf66BL54WH9W5MqVvj/view for more info about Cave in LFFBFFFFL Diagram*/
  private isCave(position: IPosition): boolean {
    const { backwardPosition, ...closedPositions } = this.getClosedPositions(position);

    return Object.entries(closedPositions).every(([_, closedPosition]) => this.isObstacle(closedPosition));
  }

  /* Validate if rover is not surround with obstacles */
  private canMove(closedPositions: IClosedPositions): boolean {
    return Object.entries(closedPositions).some(([_, closedPosition]) => !this.isObstacle(closedPosition));
  }


  /* 
    Get Slopes [Vertical - Horizontal] of X or Y Axis by position direction, 
    Vertical Axis => parallel position direction [Vertical Axis is used to increment for forward command or decrement for backward command], 
    Horizontal Axis => perpendicular on position direction
  */
  private getAxisesSlopes(positionIndex: number): IAxisesSlopes {
    let verticalAxis: Axis, horizontalAxis: Axis;
    const x_y_direction = positionIndex % 2;

    if (x_y_direction === 0) {
      verticalAxis = Axis.Y;
      horizontalAxis = Axis.X;
    }
    else {
      verticalAxis = Axis.X;
      horizontalAxis = Axis.Y;
    }

    return { verticalAxis, horizontalAxis };
  }
}