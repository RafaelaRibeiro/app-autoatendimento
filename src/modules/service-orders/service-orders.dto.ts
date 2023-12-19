export class CreateServiceOrderDTO {
  name: string;
  insurance: string;
  waitingList: number;
  receptionDepartment: string;
  gender: string;
  cpf: string;
  birthDate: Date;
  motherName: string;
  beneficiaryCode: string;
}

export class MedicalFeesServiceDTO {
  examCode: string;
  executingDepartment: string;
  doctorCode: number;
  insurance: string;
}
