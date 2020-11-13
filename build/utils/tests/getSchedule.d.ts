/// <reference types="node" />
export declare const getScheduleBySubject: (term: string, subject: string) => string[][];
export declare const getScheduleByTerm: (term: string) => string[][];
export declare const getSchedule: (term: string, subject: string, code: string) => Promise<Buffer>;
