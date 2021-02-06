import dayjs from 'dayjs';
import { getCurrentTerm } from '../utils';

describe('getCurrentTerm', () => {
    it('returns the current term', () => {
        const date = dayjs('2021-01-01');
        const term = getCurrentTerm(date);
        expect(term).toEqual('202101');
    })
})