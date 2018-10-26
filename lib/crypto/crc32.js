(function crc32() {
  const table = [];

  const poly = 0xeb31d82e; // reverse polynomial

  // build the table
  function makeTable() {
    let c; let n; let
      k;

    for (n = 0; n < 256; n += 1) {
      c = n;
      for (k = 0; k < 8; k += 1) {
        if (c & 1) {
          c = poly ^ (c >>> 1);
        } else {
          c >>>= 1;
        }
      }
      table[n] = c >>> 0;
    }
  }

  function strToArr(str) {
    // sweet hack to turn string into a 'byte' array
    return Array.prototype.map.call(str, c => c.charCodeAt(0));
  }

  /*
     * Compute CRC of array directly.
     *
     * This is slower for repeated calls, so append mode is not supported.
     */
  function crcDirect(arr) {
    let crc = -1;
    // initial contents of LFBSR

    let i; let j; let l; let
      temp;

    for (i = 0, l = arr.length; i < l; i += 1) {
      temp = (crc ^ arr[i]) & 0xff;

      // read 8 bits one at a time
      for (j = 0; j < 8; j += 1) {
        if ((temp & 1) === 1) {
          temp = (temp >>> 1) ^ poly;
        } else {
          temp >>>= 1;
        }
      }
      crc = (crc >>> 8) ^ temp;
    }

    // flip bits
    return crc ^ -1;
  }

  /*
     * Compute CRC with the help of a pre-calculated table.
     *
     * This supports append mode, if the second parameter is set.
     */
  function crcTable(arr, append) {
    let crc; let i; let
      l;

    // if we're in append mode, don't reset crc
    // if arr is null or undefined, reset table and return
    if (typeof crcTable.crc === 'undefined' || !append || !arr) {
      crcTable.crc = 0 ^ -1;

      if (!arr) {
        return;
      }
    }

    // store in temp variable for minor speed gain
    crc = crcTable.crc;

    for (i = 0, l = arr.length; i < l; i += 1) {
      crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
    }

    crcTable.crc = crc;

    return crc ^ -1;
  }

  // build the table
  // this isn't that costly, and most uses will be for table assisted mode
  makeTable();

  module.exports = function tempFn(val, direct) {
    const val2 = (typeof val === 'string') ? strToArr(val) : val;

    const ret = direct ? crcDirect(val2) : crcTable(val2);

    // convert to 2's complement hex
    return (ret >>> 0).toString(16);
  };
  module.exports.direct = crcDirect;
  module.exports.table = crcTable;
}());
