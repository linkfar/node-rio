"use strict";

var parseUtil = require("./parse-util"),
    trace = require("./trace");

function parse_SEXP(buf, offset) {
    var r, i, oi, ra, rl, eoa, len, n, k, v, res = [];

    r = buf;
    i = offset;

    ra = parseUtil.int8(r, i);
    rl = parseUtil.int24(r, i + 1);
    i += 4;
    offset = i + rl;
    eoa = offset;
    if ((ra & 64) === 64) {
        trace.log("sorry, long packets are not supported (yet).");
    }

    trace.log("Type SEXP " + ra);

    if (ra === 32) { // Integer array
        while (i < eoa) {
            res.push(parseUtil.int32(r, i));
            i += 4;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 33) { // double array
        while (i < eoa) {
            res.push(parseUtil.flt64(r, i));
            i += 8;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 34) { // string array
        oi = i;
        while (i < eoa) {
            if (r[i] === 0) {
                res.push(r.toString("utf8", oi, i));
                oi = i + 1;
            }
            i += 1;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 36) { // boolean array
        n = parseUtil.int32(r, i);
        i += 4;
        k = 0;
        while (k < n) {
            v = parseUtil.int8(r, i);
            res.push((v === 1) ? true : ((v === 0) ? false : null));
            i += 1;
            k += 1;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 37) { // raw vector
        len = parseUtil.int32(r, i);
        i += 4;
        res = r.slice(i, i + len);
        return res;
    }

    trace.log("Type " + ra + " is currently not implemented");

    return res;
}
exports.parse_SEXP = parse_SEXP;