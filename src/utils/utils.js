export class Utils {
    static matchRuleShort(str, rule) {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
    }

    static isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    static getCourse() {
        if(!window || !location) {
            return undefined;
        }

        // Matches "anything/course/12345" or "anything/course/anything/12345", and group 1 is the 5 digits at the end
        return window.location.href.match(/.*\/course\/.*\/?(\w{5})/)[1];
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
}
