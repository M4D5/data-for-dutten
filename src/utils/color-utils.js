import {Utils} from "./utils";

export class ColorUtils {
    /**
     * Returns the hsl color string for the value using the specified color range.
     */
    static colorRangeToString(value, colorRange) {
        const range = colorRange.maxHue - colorRange.minHue;

        // The processed value is the value after it is adjusted so that is offset by colorRange.startRangeAt
        let processedValue = Utils.clamp(value / colorRange.maxValue, 0, 1);

        if (colorRange.minValue !== 0) {
            processedValue = (value - colorRange.minValue) / (colorRange.maxValue - colorRange.minValue);
        }

        // The processed value is then scaled by the range, and added to the minimum hue to achieve the final hue value
        const hueOffset = processedValue * range;
        const hue = Utils.clamp(hueOffset + colorRange.minHue, colorRange.minHue, colorRange.maxHue);

        return `hsl(${hue}, 100%, 50%)`;
    }
}
