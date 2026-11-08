import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description:
      'JWT access token. Send as `Authorization: Bearer <accessToken>`.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQxZjY3Y2E4LTU2YjItNDEwYi04YjQwLTM2YzQ5ZjE2ZjIwYiIsImlhdCI6MTczMDk4NTYwMCwiZXhwIjoxNzMwOTkyODAwfQ.signature',
  })
  accessToken: string;
}
