# Unicode



**Code points:** Unicode maps the characters it supports to numbers called code points.

**Code units:** To store or transmit code points, they are encoded as code units, pieces of data with a fixed length. The length is measured in bits and determined by an encoding scheme, of which Unicode has several ones: UTF-8, UTF-16, etc. The number in the name indicates the length of the code units, in bits. If a code point is too large to fit into a single code unit, it must be broken up into multiple units. That is, the number of code units needed to represent a single code point can vary.

**BOM (byte order mark):** A magic number at the start of a text stream can signal several things to a program reading the text.

  **Big Endian:** most significant bytes come first.
  **Little Endian:** least significant bytes come first.



## Code points

The range of the code points is now divided into 17 planes, numbered from 0 to 16. Each plane comprises 16 bits (in hexadecimal notation: 0x0000–0xFFFF).

- Plane 0: Basic Multilingual Plane (BMP): 0x0000–0xFFFF
- Plane 1: Supplementary Multilingual Plane (SMP): 0x10000–0x1FFFF
- Plane 2: Supplementary Ideographic Plane (SIP): 0x20000–0x2FFFF
- Planes 3–13: Unassigned
- Plane 14: Supplement­ary Special-Purpose Plane (SSP: 0xE0000–0xEFFFF
- Planes 15–16: Supplement­ary Private Use Area (S PUA A/B): 0x0F0000–0x10FFFF

Planes 1–16 are called `supplementary planes` or `astral planes`.



## Unicode encodings

UTF stands for "Unicode Transformation Format". UTF refers to several types of Unicode character encodings, including UTF-7, UTF-8, UTF-16, and UTF-32.

**UTF-7** uses 7 bits for each character. It was designed to represent ASCII characters in email messages that required Unicode encoding.

**UTF-8** the most popular type of Unicode encoding. It uses one byte for standard English letters and symbols, two bytes for additional Latin and Middle Eastern characters, and three bytes for Asian characters. Additional characters can be represented using four bytes. UTF-8 is backwards compatible with ASCII, since the first 128 characters are mapped to the same values. The encoding scheme:

- 0000–007F: 0xxxxxxx (7 bits, stored in 1 byte)
- 0080–07FF: 110xxxxx, 10xxxxxx (5+6 bits = 11 bits, stored in 2 bytes)
- 0800–FFFF: 1110xxxx, 10xxxxxx, 10xxxxxx (4+6+6 bits = 16 bits, stored in 3 bytes)
- 10000–1FFFFF: 11110xxx, 10xxxxxx, 10xxxxxx, 10xxxxxx (3+6+6+6 bits = 21 bits, stored in 4 bytes)

**UTF-16** an extension of the "UCS-2" Unicode encoding, which uses two bytes to represent 65,536 characters. However, UTF-16 also supports four bytes for additional characters up to one million.

- U+0000 to U+D7FF and U+E000 to U+FFFF: Both UTF-16 and UCS-2 encode code points in this range as single 16-bit code units that are numerically equal to the corresponding code points.

- U+D800 to U+DFFF: The Unicode standard permanently reserves these code point values for UTF-16 encoding of the high and low surrogates, and they will never be assigned a character, so there should be no reason to encode them.

- U+010000 to U+10FFFF: Code points from the other planes are encoded as two 16-bit code units called a surrogate pair ---- high surrogate and low surrogate or leading and trailing surrogates. To encode a code point (U), first subtract 0x10000 from U and we have U', The high ten bits of U' are added to 0xD800 to give the first 16-bit code (W1), the low ten bits are added to 0xDC00 to give the second 16-bit code unit (W2).

  ```
  U' = yyyyyyyyyyxxxxxxxxxx  // U - 0x10000
  W1 = 110110yyyyyyyyyy      // 0xD800 + yyyyyyyyyy
  W2 = 110111xxxxxxxxxx      // 0xDC00 + xxxxxxxxxx
  ```

**UTF-32** a multibyte encoding that represents each character with 4 bytes.



## References

- [Unicode and JavaScript](https://2ality.com/2013/09/javascript-unicode.html)
- [UTF Definition](https://techterms.com/definition/utf)
- [Byte order mark](https://en.wikipedia.org/wiki/Byte_order_mark)
- [UTF-16](https://en.wikipedia.org/wiki/UTF-16)

