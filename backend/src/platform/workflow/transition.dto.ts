import { IsInt, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class TransitionCommand {
  @ApiProperty() @IsUUID() instanceId!: string;
  @ApiProperty({ description: 'Idempotency key; unique within this workflow instance' }) @IsUUID() requestId!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) currentState!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) targetState!: string;
  @ApiProperty() @IsInt() @Min(0) expectedVersion!: number;
  @ApiProperty() @IsInt() @Min(1) evidenceRevision!: number;
  @ApiProperty() @IsString() @MaxLength(2000) comments!: string;
}
