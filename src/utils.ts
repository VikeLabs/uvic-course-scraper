import request from 'request-promise';

enum term {
  '01',
  '05',
  '09',
}

function monthToTerm(month: number): term {
  if (month < 1 || month > 12) {
    throw new Error(`${month} is Not a valid month`);
  }

  if (1 <= month && month < 5) {
    return term['01'];
  } else if (5 <= month && month < 9) {
    return term['05'];
  } else {
    return term['09'];
  }
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function getTermString(currentYear: number, currentTerm: term, delta: number): string {
  const termNumber = currentTerm.valueOf() + delta;

  currentYear += Math.floor(termNumber / 3);
  currentTerm = mod(termNumber, 3);

  return currentYear.toString() + term[currentTerm].toString();
}

export function getCurrentTerms(plusMinus: number): string[] {
  const currentTime = new Date();

  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth() + 1;
  const currentTerm = monthToTerm(currentMonth);

  const terms: string[] = [];
  for (let delta = 1; delta <= plusMinus; delta++) {
    terms.push(getTermString(currentYear, currentTerm, delta));
    terms.push(getTermString(currentYear, currentTerm, -1 * delta));
  }

  terms.push(getTermString(currentYear, currentTerm, 0));

  return terms.sort();
}

interface QueuedRequest {
  url: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

let activeRequests = 0;
export let totalRequests = 0;
export let failedRequests = 0;
const REQ_LIMIT = 15;
const waitlist: QueuedRequest[] = [];
export function rateLimitedRequest(url: string): Promise<any> {
  if (activeRequests < REQ_LIMIT) {
    activeRequests++;
    totalRequests++;
    return request(url)
      .catch(e => {
        failedRequests++;
        throw e;
      })
      .finally(() => {
        activeRequests--;
        if (waitlist.length) {
          const qReq = waitlist.shift();
          if (qReq) {
            rateLimitedRequest(qReq.url)
              .then(qReq.resolve)
              .catch(qReq.reject);
          }
        }
      });
  }
  return new Promise((resolvedfn, rejectfn) => waitlist.push({ url: url, resolve: resolvedfn, reject: rejectfn }));
}
