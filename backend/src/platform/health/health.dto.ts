import { ApiProperty } from '@nestjs/swagger';
export class HealthChecksDto {
  @ApiProperty({ enum: ['up', 'down'] }) database!: 'up' | 'down';
  @ApiProperty({ enum: ['up', 'down'] }) redis!: 'up' | 'down';
  @ApiProperty({ enum: ['up', 'down'] }) storage!: 'up' | 'down';
}
export class LiveHealthDto {
  @ApiProperty({ example: 'ok' }) status!: string;
  @ApiProperty({ format: 'date-time' }) timestamp!: string;
}
export class PlatformHealthDto extends LiveHealthDto {
  @ApiProperty({ type: HealthChecksDto }) checks!: HealthChecksDto;
}
