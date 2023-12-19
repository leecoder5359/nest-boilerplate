import { ApiProperty } from '@nestjs/swagger';
import { PageSort } from '../types/page-sort.type';

export class CommonRes<T> {
  @ApiProperty({ required: true, example: '성공 여부' })
  success: boolean;

  @ApiProperty({ required: true, example: '성공시 메세지' })
  message: string;

  @ApiProperty({ required: true, example: '정렬방식' })
  sort: PageSort;

  @ApiProperty({ required: true, example: '응답 객체 || 응답 메세지' })
  data: T;

  constructor(success: boolean, message: string, data: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static of<T>(message: string, data: T) {
    return new CommonRes(true, message, data);
  }
}
