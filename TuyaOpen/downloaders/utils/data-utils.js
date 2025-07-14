/**
 * 数据处理工具类 - 基于T5重构计划的数据处理需求
 * 提供数据转换、对齐、验证和格式化功能
 * 支持T5芯片固件数据的各种处理需求
 */

class DataUtils {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.name = 'DataUtils';
    }

    /**
     * 调试输出
     */
    trace(message) {
        if (this.debugMode) {
            console.log(`[${this.name}] ${message}`);
        }
    }

    /**
     * 数据256字节对齐 - 对应Python版本的数据对齐逻辑
     * @param {Uint8Array|Array} data 原始数据
     * @param {number} alignment 对齐字节数，默认256
     * @param {number} fillValue 填充值，默认0xFF
     * @returns {Uint8Array} 对齐后的数据
     */
    static alignData(data, alignment = 0x100, fillValue = 0xff) {
        if (data.length % alignment === 0) {
            // 已经对齐，直接返回副本
            return new Uint8Array(data);
        }
        
        const paddingSize = alignment - (data.length % alignment);
        const alignedData = new Uint8Array(data.length + paddingSize);
        
        // 复制原始数据
        alignedData.set(data);
        
        // 填充剩余部分
        alignedData.fill(fillValue, data.length);
        
        console.log(`[DataUtils] 数据对齐: ${data.length} -> ${alignedData.length} 字节 (${alignment}字节对齐)`);
        return alignedData;
    }

    /**
     * 扇区地址对齐 - 对应Python的align_sector_addr逻辑
     * @param {number} startAddr 起始地址
     * @param {Uint8Array|Array} fileData 文件数据
     * @param {number} sectorSize 扇区大小，默认4K
     * @returns {Object} {alignedAddr: number, alignedData: Uint8Array}
     */
    static alignSectorAddress(startAddr, fileData, sectorSize = 0x1000) {
        // 计算扇区对齐的起始地址
        const alignedAddr = Math.floor(startAddr / sectorSize) * sectorSize;
        const offsetInSector = startAddr - alignedAddr;
        
        if (offsetInSector === 0) {
            // 已经对齐，直接返回
            return {
                alignedAddr: startAddr,
                alignedData: new Uint8Array(fileData)
            };
        }
        
        // 需要对齐：在数据前面填充0xFF
        const alignedData = new Uint8Array(offsetInSector + fileData.length);
        alignedData.fill(0xff, 0, offsetInSector);  // 前面填充0xFF
        alignedData.set(fileData, offsetInSector);   // 设置实际数据
        
        console.log(`[DataUtils] 扇区地址对齐: 0x${startAddr.toString(16)} -> 0x${alignedAddr.toString(16)}, 数据长度: ${fileData.length} -> ${alignedData.length}`);
        
        return {
            alignedAddr,
            alignedData
        };
    }

    /**
     * 检查缓冲区是否全为指定值
     * @param {Uint8Array|Array} buffer 缓冲区
     * @param {number} value 检查的值，默认0xFF
     * @returns {boolean} 是否全为指定值
     */
    static isBufferAllValue(buffer, value = 0xff) {
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] !== value) {
                return false;
            }
        }
        return true;
    }

    /**
     * 检查缓冲区是否全为0xFF - 专用方法
     * @param {Uint8Array|Array} buffer 缓冲区
     * @returns {boolean} 是否全为0xFF
     */
    static isBufferAll0xFF(buffer) {
        return this.isBufferAllValue(buffer, 0xff);
    }

    /**
     * 检查缓冲区是否全为0x00
     * @param {Uint8Array|Array} buffer 缓冲区
     * @returns {boolean} 是否全为0x00
     */
    static isBufferAll0x00(buffer) {
        return this.isBufferAllValue(buffer, 0x00);
    }

    /**
     * 数据分块 - 将大数据分成指定大小的块
     * @param {Uint8Array|Array} data 原始数据
     * @param {number} chunkSize 块大小，默认4K
     * @returns {Array<Uint8Array>} 数据块数组
     */
    static chunkData(data, chunkSize = 0x1000) {
        const chunks = [];
        
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            chunks.push(new Uint8Array(chunk));
        }
        
        console.log(`[DataUtils] 数据分块: ${data.length} 字节 -> ${chunks.length} 块 (每块${chunkSize}字节)`);
        return chunks;
    }

    /**
     * 合并数据块
     * @param {Array<Uint8Array>} chunks 数据块数组
     * @returns {Uint8Array} 合并后的数据
     */
    static mergeChunks(chunks) {
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const mergedData = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of chunks) {
            mergedData.set(chunk, offset);
            offset += chunk.length;
        }
        
        console.log(`[DataUtils] 数据块合并: ${chunks.length} 块 -> ${totalLength} 字节`);
        return mergedData;
    }

    /**
     * 数据格式转换 - 数组转Uint8Array
     * @param {Array|Uint8Array} data 输入数据
     * @returns {Uint8Array} 转换后的数据
     */
    static toUint8Array(data) {
        if (data instanceof Uint8Array) {
            return data;
        }
        return new Uint8Array(data);
    }

    /**
     * 数据格式转换 - Uint8Array转数组
     * @param {Uint8Array|Array} data 输入数据
     * @returns {Array} 转换后的数组
     */
    static toArray(data) {
        if (Array.isArray(data)) {
            return data;
        }
        return Array.from(data);
    }

    /**
     * 16进制字符串格式化
     * @param {Uint8Array|Array} data 数据
     * @param {number} groupSize 分组大小，默认16字节一行
     * @param {boolean} showAddress 是否显示地址，默认true
     * @param {number} baseAddr 基地址，默认0
     * @returns {string} 格式化的16进制字符串
     */
    static formatHexString(data, groupSize = 16, showAddress = true, baseAddr = 0) {
        const lines = [];
        
        for (let i = 0; i < data.length; i += groupSize) {
            const chunk = data.slice(i, i + groupSize);
            const hexBytes = Array.from(chunk)
                .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                .join(' ');
            
            if (showAddress) {
                const addr = (baseAddr + i).toString(16).padStart(8, '0').toUpperCase();
                lines.push(`${addr}: ${hexBytes}`);
            } else {
                lines.push(hexBytes);
            }
        }
        
        return lines.join('\n');
    }

    /**
     * 计算数据校验和
     * @param {Uint8Array|Array} data 数据
     * @param {string} algorithm 算法类型：'sum8', 'sum16', 'xor8'
     * @returns {number} 校验和
     */
    static calculateChecksum(data, algorithm = 'sum8') {
        switch (algorithm) {
            case 'sum8':
                return data.reduce((sum, byte) => (sum + byte) & 0xff, 0);
            case 'sum16':
                return data.reduce((sum, byte) => (sum + byte) & 0xffff, 0);
            case 'xor8':
                return data.reduce((xor, byte) => xor ^ byte, 0);
            default:
                throw new Error(`不支持的校验算法: ${algorithm}`);
        }
    }

    /**
     * 数据填充 - 将数据填充到指定长度
     * @param {Uint8Array|Array} data 原始数据
     * @param {number} targetLength 目标长度
     * @param {number} fillValue 填充值，默认0xFF
     * @param {string} position 填充位置：'end'(末尾), 'start'(开始)
     * @returns {Uint8Array} 填充后的数据
     */
    static padData(data, targetLength, fillValue = 0xff, position = 'end') {
        if (data.length >= targetLength) {
            return new Uint8Array(data.slice(0, targetLength));
        }
        
        const paddedData = new Uint8Array(targetLength);
        const paddingSize = targetLength - data.length;
        
        if (position === 'end') {
            paddedData.set(data, 0);
            paddedData.fill(fillValue, data.length);
        } else if (position === 'start') {
            paddedData.fill(fillValue, 0, paddingSize);
            paddedData.set(data, paddingSize);
        } else {
            throw new Error(`不支持的填充位置: ${position}`);
        }
        
        console.log(`[DataUtils] 数据填充: ${data.length} -> ${targetLength} 字节 (${position}填充${paddingSize}字节)`);
        return paddedData;
    }

    /**
     * 比较两个数据缓冲区
     * @param {Uint8Array|Array} data1 数据1
     * @param {Uint8Array|Array} data2 数据2
     * @param {number} maxDifferences 最大差异数量，默认10
     * @returns {Object} 比较结果 {isEqual: boolean, differences: Array}
     */
    static compareData(data1, data2, maxDifferences = 10) {
        const differences = [];
        const minLength = Math.min(data1.length, data2.length);
        const maxLength = Math.max(data1.length, data2.length);
        
        // 比较公共部分
        for (let i = 0; i < minLength && differences.length < maxDifferences; i++) {
            if (data1[i] !== data2[i]) {
                differences.push({
                    offset: i,
                    value1: data1[i],
                    value2: data2[i],
                    hex1: data1[i].toString(16).padStart(2, '0').toUpperCase(),
                    hex2: data2[i].toString(16).padStart(2, '0').toUpperCase()
                });
            }
        }
        
        // 处理长度不同的情况
        if (data1.length !== data2.length && differences.length < maxDifferences) {
            differences.push({
                type: 'length_mismatch',
                length1: data1.length,
                length2: data2.length,
                extraBytes: maxLength - minLength
            });
        }
        
        return {
            isEqual: differences.length === 0,
            differences,
            totalChecked: minLength,
            sizeMismatch: data1.length !== data2.length
        };
    }

    /**
     * 数据压缩 - 简单的RLE压缩
     * @param {Uint8Array|Array} data 原始数据
     * @returns {Object} {compressed: Uint8Array, originalSize: number, compressedSize: number}
     */
    static compressRLE(data) {
        const compressed = [];
        let i = 0;
        
        while (i < data.length) {
            const currentByte = data[i];
            let count = 1;
            
            // 计算连续相同字节的数量
            while (i + count < data.length && data[i + count] === currentByte && count < 255) {
                count++;
            }
            
            if (count > 3 || currentByte === 0xff) {
                // 使用RLE编码：[0xFF, count, value]
                compressed.push(0xff, count, currentByte);
            } else {
                // 直接存储
                for (let j = 0; j < count; j++) {
                    compressed.push(currentByte);
                }
            }
            
            i += count;
        }
        
        const compressedData = new Uint8Array(compressed);
        console.log(`[DataUtils] RLE压缩: ${data.length} -> ${compressedData.length} 字节 (压缩率: ${((1 - compressedData.length / data.length) * 100).toFixed(1)}%)`);
        
        return {
            compressed: compressedData,
            originalSize: data.length,
            compressedSize: compressedData.length,
            compressionRatio: data.length > 0 ? (compressedData.length / data.length) : 1
        };
    }

    /**
     * 数据解压 - RLE解压
     * @param {Uint8Array|Array} compressedData 压缩数据
     * @returns {Uint8Array} 解压后的数据
     */
    static decompressRLE(compressedData) {
        const decompressed = [];
        let i = 0;
        
        while (i < compressedData.length) {
            if (compressedData[i] === 0xff && i + 2 < compressedData.length) {
                // RLE编码数据
                const count = compressedData[i + 1];
                const value = compressedData[i + 2];
                
                for (let j = 0; j < count; j++) {
                    decompressed.push(value);
                }
                i += 3;
            } else {
                // 直接数据
                decompressed.push(compressedData[i]);
                i++;
            }
        }
        
        const decompressedData = new Uint8Array(decompressed);
        console.log(`[DataUtils] RLE解压: ${compressedData.length} -> ${decompressedData.length} 字节`);
        return decompressedData;
    }

    /**
     * 获取数据统计信息
     * @param {Uint8Array|Array} data 数据
     * @returns {Object} 统计信息
     */
    static getDataStats(data) {
        const byteCounts = new Array(256).fill(0);
        let minValue = 255;
        let maxValue = 0;
        let sum = 0;
        
        for (const byte of data) {
            byteCounts[byte]++;
            minValue = Math.min(minValue, byte);
            maxValue = Math.max(maxValue, byte);
            sum += byte;
        }
        
        const nonZeroBytes = byteCounts.filter(count => count > 0).length;
        const mostCommonByte = byteCounts.indexOf(Math.max(...byteCounts));
        const leastCommonByte = byteCounts.indexOf(Math.min(...byteCounts.filter(count => count > 0)));
        
        return {
            length: data.length,
            minValue,
            maxValue,
            average: data.length > 0 ? (sum / data.length).toFixed(2) : 0,
            uniqueBytes: nonZeroBytes,
            mostCommonByte: {
                value: mostCommonByte,
                count: byteCounts[mostCommonByte],
                percentage: ((byteCounts[mostCommonByte] / data.length) * 100).toFixed(2) + '%'
            },
            leastCommonByte: leastCommonByte !== -1 ? {
                value: leastCommonByte,
                count: byteCounts[leastCommonByte]
            } : null,
            entropy: this.calculateEntropy(byteCounts, data.length)
        };
    }

    /**
     * 计算数据熵值
     * @param {Array} byteCounts 字节计数数组
     * @param {number} totalBytes 总字节数
     * @returns {number} 熵值
     */
    static calculateEntropy(byteCounts, totalBytes) {
        let entropy = 0;
        
        for (const count of byteCounts) {
            if (count > 0) {
                const probability = count / totalBytes;
                entropy -= probability * Math.log2(probability);
            }
        }
        
        return entropy.toFixed(3);
    }

    /**
     * 数据搜索 - 在数据中搜索模式
     * @param {Uint8Array|Array} data 数据
     * @param {Uint8Array|Array} pattern 搜索模式
     * @param {number} maxMatches 最大匹配数量，默认100
     * @returns {Array<number>} 匹配位置数组
     */
    static searchPattern(data, pattern, maxMatches = 100) {
        const matches = [];
        
        for (let i = 0; i <= data.length - pattern.length && matches.length < maxMatches; i++) {
            let isMatch = true;
            
            for (let j = 0; j < pattern.length; j++) {
                if (data[i + j] !== pattern[j]) {
                    isMatch = false;
                    break;
                }
            }
            
            if (isMatch) {
                matches.push(i);
            }
        }
        
        console.log(`[DataUtils] 模式搜索: 找到 ${matches.length} 个匹配`);
        return matches;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataUtils;
} else if (typeof window !== 'undefined') {
    window.DataUtils = DataUtils;
}