export type Textbook = {
  bookstoreUrl?: string;
  imageUrl?: string;
  title: string;
  authors?: string[];
  required: boolean;
  // prices stored in the following format '$78.95'
  // TODO: format these in cents and store as number
  price: {
    newCad?: string;
    usedCad?: string;
    digitalAccessCad?: string;
    newAndDigitalAccessCad?: string;
  };
  isbn?: string;
  instructor?: string;
};

export type CourseTextbooks = {
  subject: string;
  code: string;
  section?: string;
  additionalInfo?: string[];
  instructor?: string;
  textbooks: Textbook[];
};
