import { expect } from 'chai';
import { Direction } from './rover.enums';
import { RoverService } from './rover.service';


describe('RoverService [/rover]', () => {
  let roverService: RoverService;

  beforeEach(() => {
    roverService = new RoverService();
    (<any> roverService).logger.disabled = true;
  });

  describe('create', () => {

    it('Should Successfully Create New Rover', () => {
      roverService.create({ x_axis: 4, y_axis: 2, direction: Direction.EAST });

      expect((<any> roverService).position).to.be.deep.equals({ x_axis: 4, y_axis: 2, direction: Direction.EAST });
    });
  });


  describe('move', () => {

    it('Should Rotate Rover', () => {
      (<any> roverService).position = { x_axis: 0, y_axis: 0, direction: Direction.NORTH };
      const position = roverService.move('R');

      expect(position).to.be.deep.equals({ x_axis: 0, y_axis: 0, direction: Direction.EAST })
    });

    it('Should Move Rover one step to another location with same direction', () => {
      (<any> roverService).position = { x_axis: 0, y_axis: 0, direction: Direction.NORTH };
      const position = roverService.move('F');

      expect(position).to.be.deep.equals({ x_axis: 0, y_axis: 1, direction: Direction.NORTH })
    });

    it('Should Move Rover to another location by many steps and directions', () => {
      (<any> roverService).position = { x_axis: 4, y_axis: 2, direction: Direction.EAST };
      const position = roverService.move('FLFFFRFLB');

      expect(position).to.be.deep.equals({ x_axis: 6, y_axis: 4, direction: Direction.NORTH })
    });

    it('Should Failed to Move non exist Rover', () => {
      expect(() => roverService.move('FLFF')).to.throw('Rover not created to move');
    });

    it('Should Failed to Move with Invalid Commands', () => {
      (<any> roverService).position = { x_axis: 4, y_axis: 2, direction: Direction.EAST };

      expect(() => roverService.move('LGF')).to.throw('Invalid Command G in LGF');
    });

    it('Should Failed to Move with Cause of Collision', () => {
      (<any> roverService).position = { x_axis: 1, y_axis: 3, direction: Direction.EAST };

      expect(() => roverService.move('LF')).to.throw('(1, 3) EAST STOPPED');
    });
  });

  describe('getCommand', () => {

    it('Should Move Forward without any rotations', () => {
      (<any> roverService).position = { x_axis: 0, y_axis: 0, direction: Direction.NORTH };
      const command = roverService.getCommand();

      expect(command).to.be.deep.equals('FFFFFFFFF');
    });

    /* check https://drive.google.com/file/d/1bcVDtc0COSt40wdf66BL54WH9W5MqVvj/view LFFRFLFFF Diagram*/
    it('Should Move Forward Between obstacles', () => {
      (<any> roverService).position = { x_axis: 0, y_axis: 0, direction: Direction.NORTH };
      (<any> roverService).obstacles = new Set(['0,1', '-1,1', '-3,0', '-2,-1', '-2,2', '-3,2', '-1,1']);

      const command = roverService.getCommand();

      expect(command).to.be.deep.equals('LFFRFLFFF');
      roverService.move('LFFRFLFFF')
    });

    /* check https://drive.google.com/file/d/1bcVDtc0COSt40wdf66BL54WH9W5MqVvj/view LFFBFFFFL Diagram*/
    it('Should Move And Go Back to same position cause of blocked direction', () => {
      (<any> roverService).position = { x_axis: 0, y_axis: 0, direction: Direction.NORTH };
      (<any> roverService).obstacles = new Set(['0,1', '-1,1', '-3,0', '-2,-1', '-2,2', '-3,1', '-1,1', '2,0']);

      const command = roverService.getCommand();

      expect(command).to.be.deep.equals('LFFLLFFFL');
      roverService.move('LFFLLFFFL')
    });

    it('Should Failed to Move non exist Rover', () => {
      expect(() => roverService.getCommand()).to.throw('Rover not created to move');
    });

    it('Should Failed to Move as Rover is surrounded with obstacles', () => {
      (<any> roverService).position = { x_axis: 0, y_axis: 0, direction: Direction.NORTH };
      (<any> roverService).obstacles = new Set(['0,1', '0,-1', '1,0', '-1,0']);

      expect(() => roverService.getCommand()).to.throw('Rover is surrounded with obstacles');
    });
  });
});