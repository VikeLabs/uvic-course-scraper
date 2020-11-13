"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classScheduleListingExtractor = void 0;
var dayjs_1 = __importDefault(require("dayjs"));
var customParseFormat_1 = __importDefault(require("dayjs/plugin/customParseFormat"));
dayjs_1.default.extend(customParseFormat_1.default);
/**
 * Extends course object with section info for term.
 *
 * @param {Course} course the course object to extend
 * @param {string} term the term code
 */
exports.classScheduleListingExtractor = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var regex, sections, sectionEntries, sectionIdx, section, title, m, sectionEntry, scheduleEntries, sectionInfo, additionalInfoRegex, associatedTermRegex, associatedStartRegex, associatedEndRegex, registrationDatesRegex, registrationStartRegex, registrationEndRegex, levelsRegex, sectionTypeRegex, instructionalMethodRegex, creditsRegex, yearRegex, associatedTerm, associatedStart, associatedEnd, year, registrationDates, registrationStart, registrationEnd, levels, scheduleData;
    return __generator(this, function (_a) {
        regex = /(.+) - (\d+) - ([\w|-]{0,4} \w?\d+\w?) - ([A|B|T]\d+)/;
        sections = [];
        sectionEntries = $("table[summary=\"This layout table is used to present the sections found\"]>tbody>tr");
        for (sectionIdx = 0; sectionIdx < sectionEntries.length; sectionIdx += 2) {
            section = {};
            title = $('a', sectionEntries[sectionIdx]);
            section.title = /(.*)\s-\s*\d{5}/.exec(title.text())[1];
            m = regex.exec(title.text());
            if (m) {
                section.crn = m[2];
                section.sectionCode = m[4];
            }
            sectionEntry = sectionEntries[sectionIdx + 1];
            scheduleEntries = $("table[summary=\"This table lists the scheduled meeting times and assigned instructors for this class..\"] tbody", sectionEntry)
                .text()
                .trim()
                .split('\n');
            sectionInfo = $("tr td", sectionEntry)
                .each(function (i, el) {
                $(el)
                    .find('table')
                    .remove();
                $(el)
                    .find('a')
                    .remove();
            })
                .text()
                .trim();
            additionalInfoRegex = /(.*)Associated Term/s;
            associatedTermRegex = /Associated Term:\s*(.*)/i;
            associatedStartRegex = /(\w{3})\s*-/;
            associatedEndRegex = /-\s*(\w{3})/;
            registrationDatesRegex = /Registration Dates:\s*(.*)/i;
            registrationStartRegex = /(.+)\s*to/;
            registrationEndRegex = /to\s*(.+)/;
            levelsRegex = /Levels:\s*(.+)/i;
            sectionTypeRegex = /(.*)\s+schedule\s*type/i;
            instructionalMethodRegex = /\s*(.*)\s*instructional method/i;
            creditsRegex = /\s*(\d\.\d+)\s*credits/i;
            yearRegex = /\d{4}/;
            if (additionalInfoRegex.test(sectionInfo)) {
                section.additionalInfo = additionalInfoRegex.exec(sectionInfo)[1].trim();
            }
            // Parse the associated term start and finish from the string into an object
            // i.e. "Associated Term: First Term: Sep - Dec 2019" -> { start: '201909' , end: '201912' }
            if (associatedTermRegex.test(sectionInfo)) {
                associatedTerm = associatedTermRegex.exec(sectionInfo)[1];
                if (associatedEndRegex.test(associatedTerm) &&
                    associatedStartRegex.test(associatedTerm) &&
                    yearRegex.test(associatedTerm)) {
                    associatedStart = dayjs_1.default(associatedStartRegex.exec(associatedTerm)[1], 'MMM').format('MM');
                    associatedEnd = dayjs_1.default(associatedEndRegex.exec(associatedTerm)[1], 'MMM').format('MM');
                    year = yearRegex.exec(associatedTerm)[0];
                    section.associatedTerm = {
                        start: year + associatedStart,
                        end: year + associatedEnd,
                    };
                }
            }
            // Parse the registration times from the string into an object
            // i.e. "Registration Dates: Jun 17, 2019 to Sep 20, 2019" -> { start: 'Jun 17, 2019', end: 'Sep 20, 2019' }
            if (registrationDatesRegex.test(sectionInfo)) {
                registrationDates = registrationDatesRegex.exec(sectionInfo)[1];
                if (registrationStartRegex.test(registrationDates) && registrationEndRegex.test(registrationDates)) {
                    registrationStart = registrationStartRegex.exec(registrationDates)[1].trim();
                    registrationEnd = registrationEndRegex.exec(registrationDates)[1].trim();
                    section.registrationDates = {
                        start: registrationStart,
                        end: registrationEnd,
                    };
                }
            }
            // Parse the levels from the string and split them into an array
            // i.e. "Levels: Law, Undergraduate" -> [law, undergraduate]
            if (levelsRegex.test(sectionInfo)) {
                levels = levelsRegex
                    .exec(sectionInfo)[1]
                    .toLowerCase()
                    .trim();
                section.levels = levels.split(/,\s*/);
            }
            // Check if online campus or in-person campus
            // Might change this because in the HTML it's either: online or main campus (might be other campuses too)
            // TODO: Problem may arise if classes are offered online & in-person (i.e. lecture online, lab in person)
            if (/online/i.test(sectionInfo)) {
                section.campus = 'online';
            }
            else {
                section.campus = 'in-person';
            }
            if (sectionTypeRegex.test(sectionInfo)) {
                section.sectionType = sectionTypeRegex.exec(sectionInfo)[1].toLowerCase();
            }
            // Check if online or in-person instructional method
            if (instructionalMethodRegex.test(sectionInfo)) {
                section.instructionalMethod = instructionalMethodRegex
                    .exec(sectionInfo)[1]
                    .toLowerCase()
                    .trim();
            }
            if (creditsRegex.exec(sectionInfo)) {
                section.credits = creditsRegex.exec(sectionInfo)[1];
            }
            scheduleData = [];
            while (true) {
                scheduleEntries = scheduleEntries.slice(7);
                if (scheduleEntries[0] == '') {
                    while (scheduleEntries[0].length == 0) {
                        scheduleEntries = scheduleEntries.slice(1);
                    }
                }
                if (scheduleEntries.length == 0) {
                    break;
                }
                scheduleData.push({
                    type: scheduleEntries[0],
                    time: scheduleEntries[1],
                    days: scheduleEntries[2],
                    where: scheduleEntries[3],
                    dateRange: scheduleEntries[4],
                    scheduleType: scheduleEntries[5],
                    instructors: scheduleEntries[6].split(/\s*,\s*/),
                });
            }
            section.schedule = scheduleData;
            sections.push(section);
        }
        return [2 /*return*/, sections];
    });
}); };
