import Unit from "./Unit";
import Strings from "./Strings";


const Units = {
    M: new Unit("meter", "m", 1.0),
    KM: new Unit("kilometer", "km", 1000.0),
    MI: new Unit("mile", "mi", 1609.34),
    FT: new Unit("feet", "ft", 0.3048)
};

Units.fromString = function (string) {
    if (Strings.equalsIgnoreCase(string, "mi")) {
        return Units.MI;
    }
    else if (Strings.equalsIgnoreCase(string, "km")) {
        return Units.KM;
    }
    else if (Strings.equalsIgnoreCase(string, "m")) {
        return Units.M;
    }
    else if (Strings.equalsIgnoreCase(string, "ft")) {
        return Units.FT;
    }
};

export default Units;

