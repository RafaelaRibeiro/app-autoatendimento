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

export class CreateServiceOrderItemsDTO {
  serviceOrderSerie: number;
  serviceOrderNumber: number;
  patientID: number;
  examCode: string;
  examType: string;
  examValue: number;
}

export class MedicalFeesServiceDTO {
  examCode: string;
  examType: string;
  receptionDepartment: string;
  executingDepartment: string;
  doctorCode: number;
  insurance: string;
}
