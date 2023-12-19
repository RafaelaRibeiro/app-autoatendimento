import { IsInt, IsString } from 'class-validator';

export class addBipToWaitingListDTO {
  @IsInt()
  waitingList: number;

  @IsString()
  receptionDepartment: string;

  @IsString()
  prefix: string;
}
