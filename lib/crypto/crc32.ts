(function () {


    var table: number[] = [],
        poly = 0xeb31d82e; // reverse polynomial

    // build the table
    function makeTable() {
        var c, n, k;

        for (n = 0; n < 256; n += 1) {
            c = n;
            for (k = 0; k < 8; k += 1) {
                if (c & 1) {
                    c = poly ^ (c >>> 1);
                } else {
                    c = c >>> 1;
                }
            }
            table[n] = c >>> 0;
        }
    }

    function strToArr(str: string) {
        // sweet hack to turn string into a 'byte' array
        return Array.prototype.map.call(str, function (c) {
            return c.charCodeAt(0);
        });
    }

    /*
     * Compute CRC of array directly.
     *
     * This is slower for repeated calls, so append mode is not supported.
     */
    function crcDirect(arr: number[]) {
        var crc = -1, // initial contents of LFBSR
            i, j, l, temp;

        for (i = 0, l = arr.length; i < l; i += 1) {
            temp = (crc ^ arr[i]) & 0xff;

            // read 8 bits one at a time
            for (j = 0; j < 8; j += 1) {
                if ((temp & 1) === 1) {
                    temp = (temp >>> 1) ^ poly;
                } else {
                    temp = (temp >>> 1);
                }
            }
            crc = (crc >>> 8) ^ temp;
        }

        // flip bits
        return crc ^ -1;
    }

    var tableCrc: number | undefined = undefined

    /*
     * Compute CRC with the help of a pre-calculated table.
     *
     * This supports append mode, if the second parameter is set.
     */
    function crcTable(arr: number[], append?: boolean) {
        var crc, i, l;

        // if we're in append mode, don't reset crc
        // if arr is null or undefined, reset table and return
        if (typeof tableCrc === 'undefined' || !append || !arr) {
            tableCrc = 0 ^ -1;

            if (!arr) {
                return;
            }
        }

        // store in temp variable for minor speed gain
        crc = tableCrc;

        for (i = 0, l = arr.length; i < l; i += 1) {
            crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
        }

        tableCrc = crc;

        return crc ^ -1;
    }

    // build the table
    // this isn't that costly, and most uses will be for table assisted mode
    makeTable();

    module.exports = function (val: string | number[], direct: boolean) {
        var arr = (typeof val === 'string') ? strToArr(val) : val,
            ret = direct ? crcDirect(val as number[]) : crcTable(arr as any);

        // convert to 2's complement hex
        return ((ret as number) >>> 0).toString(16);
    };
    module.exports.direct = crcDirect;
    module.exports.table = crcTable;
}());
