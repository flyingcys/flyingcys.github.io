/**
 * 性能测试脚本
 * 用于测试JSON和XML可视化工具的性能指标
 */

class PerformanceTester {
    constructor() {
        this.results = {
            json: {},
            xml: {},
            comparison: {}
        };
        this.testData = {
            json: {
                small: this.generateJsonData(100),
                medium: this.generateJsonData(1000),
                large: this.generateJsonData(10000)
            },
            xml: {
                small: this.generateXmlData(100),
                medium: this.generateXmlData(1000),
                large: this.generateXmlData(10000)
            }
        };
    }

    // 生成测试用的JSON数据
    generateJsonData(size) {
        const data = {
            metadata: {
                version: "1.0",
                timestamp: new Date().toISOString(),
                size: size,
                generator: "performance_test"
            },
            users: [],
            products: [],
            orders: []
        };

        // 生成用户数据
        for (let i = 0; i < size / 3; i++) {
            data.users.push({
                id: i + 1,
                name: `用户${i + 1}`,
                email: `user${i + 1}@example.com`,
                age: Math.floor(Math.random() * 50) + 18,
                active: Math.random() > 0.5,
                profile: {
                    avatar: `https://example.com/avatar${i + 1}.jpg`,
                    bio: `这是用户${i + 1}的个人简介`,
                    preferences: {
                        theme: Math.random() > 0.5 ? "dark" : "light",
                        language: Math.random() > 0.5 ? "zh-CN" : "en-US",
                        notifications: Math.random() > 0.5
                    },
                    tags: [`tag${i % 10}`, `category${i % 5}`]
                }
            });
        }

        // 生成产品数据
        for (let i = 0; i < size / 3; i++) {
            data.products.push({
                id: i + 1,
                name: `产品${i + 1}`,
                price: Math.floor(Math.random() * 1000) + 10,
                category: `分类${i % 10}`,
                inStock: Math.random() > 0.3,
                specifications: {
                    weight: Math.floor(Math.random() * 1000) + 100,
                    dimensions: {
                        width: Math.floor(Math.random() * 100) + 10,
                        height: Math.floor(Math.random() * 100) + 10,
                        depth: Math.floor(Math.random() * 100) + 10
                    },
                    materials: [`材料${i % 5}`, `材料${(i + 1) % 5}`]
                }
            });
        }

        // 生成订单数据
        for (let i = 0; i < size / 3; i++) {
            data.orders.push({
                id: i + 1,
                userId: Math.floor(Math.random() * (size / 3)) + 1,
                productIds: [
                    Math.floor(Math.random() * (size / 3)) + 1,
                    Math.floor(Math.random() * (size / 3)) + 1
                ],
                total: Math.floor(Math.random() * 5000) + 100,
                status: ["pending", "processing", "shipped", "delivered"][i % 4],
                createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        return JSON.stringify(data, null, 2);
    }

    // 生成测试用的XML数据
    generateXmlData(size) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<testData xmlns:test="http://test.com/ns">\n';
        xml += '  <metadata>\n';
        xml += '    <version>1.0</version>\n';
        xml += `    <timestamp>${new Date().toISOString()}</timestamp>\n`;
        xml += `    <size>${size}</size>\n`;
        xml += '    <generator>performance_test</generator>\n';
        xml += '  </metadata>\n';
        xml += '  <users>\n';

        // 生成用户数据
        for (let i = 0; i < size / 3; i++) {
            xml += `    <user id="${i + 1}" active="${Math.random() > 0.5}">\n`;
            xml += `      <name>用户${i + 1}</name>\n`;
            xml += `      <email>user${i + 1}@example.com</email>\n`;
            xml += `      <age>${Math.floor(Math.random() * 50) + 18}</age>\n`;
            xml += '      <profile>\n';
            xml += `        <avatar>https://example.com/avatar${i + 1}.jpg</avatar>\n`;
            xml += `        <bio><![CDATA[这是用户${i + 1}的个人简介]]></bio>\n`;
            xml += '        <preferences>\n';
            xml += `          <theme>${Math.random() > 0.5 ? "dark" : "light"}</theme>\n`;
            xml += `          <language>${Math.random() > 0.5 ? "zh-CN" : "en-US"}</language>\n`;
            xml += `          <notifications>${Math.random() > 0.5}</notifications>\n`;
            xml += '        </preferences>\n';
            xml += '        <tags>\n';
            xml += `          <tag>tag${i % 10}</tag>\n`;
            xml += `          <tag>category${i % 5}</tag>\n`;
            xml += '        </tags>\n';
            xml += '      </profile>\n';
            xml += '    </user>\n';
        }

        xml += '  </users>\n';
        xml += '  <products>\n';

        // 生成产品数据
        for (let i = 0; i < size / 3; i++) {
            xml += `    <product id="${i + 1}" inStock="${Math.random() > 0.3}">\n`;
            xml += `      <name>产品${i + 1}</name>\n`;
            xml += `      <price currency="CNY">${Math.floor(Math.random() * 1000) + 10}</price>\n`;
            xml += `      <category>分类${i % 10}</category>\n`;
            xml += '      <specifications>\n';
            xml += `        <weight unit="g">${Math.floor(Math.random() * 1000) + 100}</weight>\n`;
            xml += '        <dimensions>\n';
            xml += `          <width>${Math.floor(Math.random() * 100) + 10}</width>\n`;
            xml += `          <height>${Math.floor(Math.random() * 100) + 10}</height>\n`;
            xml += `          <depth>${Math.floor(Math.random() * 100) + 10}</depth>\n`;
            xml += '        </dimensions>\n';
            xml += '        <materials>\n';
            xml += `          <material>材料${i % 5}</material>\n`;
            xml += `          <material>材料${(i + 1) % 5}</material>\n`;
            xml += '        </materials>\n';
            xml += '      </specifications>\n';
            xml += '    </product>\n';
        }

        xml += '  </products>\n';
        xml += '  <!-- 订单数据 -->\n';
        xml += '  <orders>\n';

        // 生成订单数据
        for (let i = 0; i < size / 3; i++) {
            const statuses = ["pending", "processing", "shipped", "delivered"];
            xml += `    <order id="${i + 1}" status="${statuses[i % 4]}">\n`;
            xml += `      <userId>${Math.floor(Math.random() * (size / 3)) + 1}</userId>\n`;
            xml += '      <products>\n';
            xml += `        <productId>${Math.floor(Math.random() * (size / 3)) + 1}</productId>\n`;
            xml += `        <productId>${Math.floor(Math.random() * (size / 3)) + 1}</productId>\n`;
            xml += '      </products>\n';
            xml += `      <total currency="CNY">${Math.floor(Math.random() * 5000) + 100}</total>\n`;
            xml += `      <createdAt>${new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()}</createdAt>\n`;
            xml += '    </order>\n';
        }

        xml += '  </orders>\n';
        xml += '</testData>';

        return xml;
    }

    // 测试页面加载性能
    async testPageLoad(url) {
        const startTime = performance.now();
        
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            
            iframe.onload = () => {
                const loadTime = performance.now() - startTime;
                document.body.removeChild(iframe);
                resolve({
                    loadTime: loadTime,
                    url: url
                });
            };
            
            document.body.appendChild(iframe);
        });
    }

    // 测试内存使用情况
    measureMemory() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    // 测试渲染性能
    async testRenderingPerformance(toolType, dataSize) {
        const data = this.testData[toolType][dataSize];
        const startTime = performance.now();
        
        // 模拟数据处理和渲染
        if (toolType === 'json') {
            try {
                const parsed = JSON.parse(data);
                const serialized = JSON.stringify(parsed, null, 2);
                // 模拟DOM渲染
                const div = document.createElement('div');
                div.innerHTML = this.mockJsonRender(parsed);
                document.body.appendChild(div);
                document.body.removeChild(div);
            } catch (error) {
                console.error('JSON parsing error:', error);
            }
        } else if (toolType === 'xml') {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, 'text/xml');
                // 模拟DOM渲染
                const div = document.createElement('div');
                div.innerHTML = this.mockXmlRender(xmlDoc.documentElement);
                document.body.appendChild(div);
                document.body.removeChild(div);
            } catch (error) {
                console.error('XML parsing error:', error);
            }
        }
        
        const renderTime = performance.now() - startTime;
        return {
            toolType,
            dataSize,
            renderTime,
            dataLength: data.length
        };
    }

    // 模拟JSON渲染
    mockJsonRender(obj, level = 0) {
        if (typeof obj !== 'object' || obj === null) {
            return `<span>${obj}</span>`;
        }
        
        let html = '<div>';
        for (const key in obj) {
            html += `<div style="margin-left: ${level * 20}px;">`;
            html += `<span>${key}: </span>`;
            html += this.mockJsonRender(obj[key], level + 1);
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    // 模拟XML渲染
    mockXmlRender(element, level = 0) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }
        
        let html = `<div style="margin-left: ${level * 20}px;">`;
        html += `<span>&lt;${element.tagName}&gt;</span>`;
        
        for (let child of element.children) {
            html += this.mockXmlRender(child, level + 1);
        }
        
        if (element.textContent.trim()) {
            html += `<div style="margin-left: ${(level + 1) * 20}px;">${element.textContent.trim()}</div>`;
        }
        
        html += `<span>&lt;/${element.tagName}&gt;</span>`;
        html += '</div>';
        return html;
    }

    // 测试交互响应性能
    async testInteractionPerformance() {
        const results = {};
        
        // 测试点击响应时间
        const button = document.createElement('button');
        button.textContent = 'Test Button';
        document.body.appendChild(button);
        
        const clickTimes = [];
        for (let i = 0; i < 10; i++) {
            const startTime = performance.now();
            button.click();
            const endTime = performance.now();
            clickTimes.push(endTime - startTime);
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        document.body.removeChild(button);
        
        results.averageClickResponse = clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length;
        results.maxClickResponse = Math.max(...clickTimes);
        results.minClickResponse = Math.min(...clickTimes);
        
        return results;
    }

    // 运行完整的性能测试
    async runFullTest() {
        console.log('开始性能测试...');
        
        const memoryBefore = this.measureMemory();
        
        // 测试页面加载性能
        console.log('测试页面加载性能...');
        this.results.json.pageLoad = await this.testPageLoad('./json/index.html');
        this.results.xml.pageLoad = await this.testPageLoad('./xml/index.html');
        
        // 测试渲染性能
        console.log('测试渲染性能...');
        const sizes = ['small', 'medium', 'large'];
        
        this.results.json.rendering = {};
        this.results.xml.rendering = {};
        
        for (const size of sizes) {
            this.results.json.rendering[size] = await this.testRenderingPerformance('json', size);
            this.results.xml.rendering[size] = await this.testRenderingPerformance('xml', size);
        }
        
        // 测试交互性能
        console.log('测试交互性能...');
        this.results.interaction = await this.testInteractionPerformance();
        
        const memoryAfter = this.measureMemory();
        
        // 计算内存使用差异
        if (memoryBefore && memoryAfter) {
            this.results.memoryUsage = {
                before: memoryBefore,
                after: memoryAfter,
                difference: memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize
            };
        }
        
        // 生成比较分析
        this.generateComparison();
        
        console.log('性能测试完成！');
        return this.results;
    }

    // 生成比较分析
    generateComparison() {
        const json = this.results.json;
        const xml = this.results.xml;
        
        this.results.comparison = {
            pageLoadComparison: {
                jsonFaster: json.pageLoad.loadTime < xml.pageLoad.loadTime,
                difference: Math.abs(json.pageLoad.loadTime - xml.pageLoad.loadTime),
                percentage: Math.abs((json.pageLoad.loadTime - xml.pageLoad.loadTime) / Math.max(json.pageLoad.loadTime, xml.pageLoad.loadTime) * 100)
            },
            renderingComparison: {},
            recommendations: []
        };
        
        // 比较渲染性能
        const sizes = ['small', 'medium', 'large'];
        for (const size of sizes) {
            const jsonTime = json.rendering[size].renderTime;
            const xmlTime = xml.rendering[size].renderTime;
            
            this.results.comparison.renderingComparison[size] = {
                jsonFaster: jsonTime < xmlTime,
                difference: Math.abs(jsonTime - xmlTime),
                percentage: Math.abs((jsonTime - xmlTime) / Math.max(jsonTime, xmlTime) * 100)
            };
        }
        
        // 生成建议
        this.generateRecommendations();
    }

    // 生成性能优化建议
    generateRecommendations() {
        const recommendations = [];
        
        // 基于页面加载时间的建议
        if (this.results.json.pageLoad.loadTime > 1000) {
            recommendations.push({
                type: 'JSON工具优化',
                priority: 'high',
                suggestion: 'JSON工具页面加载时间超过1秒，建议优化CSS和JavaScript加载'
            });
        }
        
        if (this.results.xml.pageLoad.loadTime > 1000) {
            recommendations.push({
                type: 'XML工具优化',
                priority: 'high',
                suggestion: 'XML工具页面加载时间超过1秒，建议优化CSS和JavaScript加载'
            });
        }
        
        // 基于渲染性能的建议
        const largeJsonRender = this.results.json.rendering.large.renderTime;
        const largeXmlRender = this.results.xml.rendering.large.renderTime;
        
        if (largeJsonRender > 500) {
            recommendations.push({
                type: 'JSON渲染优化',
                priority: 'medium',
                suggestion: '大数据量JSON渲染较慢，建议实现虚拟滚动或分页加载'
            });
        }
        
        if (largeXmlRender > 500) {
            recommendations.push({
                type: 'XML渲染优化',
                priority: 'medium',
                suggestion: '大数据量XML渲染较慢，建议实现虚拟滚动或分页加载'
            });
        }
        
        // 基于内存使用的建议
        if (this.results.memoryUsage && this.results.memoryUsage.difference > 10 * 1024 * 1024) {
            recommendations.push({
                type: '内存优化',
                priority: 'medium',
                suggestion: '测试过程中内存使用增长较大，建议优化内存管理和垃圾回收'
            });
        }
        
        this.results.comparison.recommendations = recommendations;
    }

    // 生成性能报告
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(),
            detailed: this.results,
            recommendations: this.results.comparison.recommendations
        };
        
        return report;
    }

    // 生成摘要
    generateSummary() {
        const json = this.results.json;
        const xml = this.results.xml;
        
        return {
            pageLoad: {
                json: `${json.pageLoad.loadTime.toFixed(2)}ms`,
                xml: `${xml.pageLoad.loadTime.toFixed(2)}ms`,
                winner: json.pageLoad.loadTime < xml.pageLoad.loadTime ? 'JSON' : 'XML'
            },
            rendering: {
                small: {
                    json: `${json.rendering.small.renderTime.toFixed(2)}ms`,
                    xml: `${xml.rendering.small.renderTime.toFixed(2)}ms`,
                    winner: json.rendering.small.renderTime < xml.rendering.small.renderTime ? 'JSON' : 'XML'
                },
                medium: {
                    json: `${json.rendering.medium.renderTime.toFixed(2)}ms`,
                    xml: `${xml.rendering.medium.renderTime.toFixed(2)}ms`,
                    winner: json.rendering.medium.renderTime < xml.rendering.medium.renderTime ? 'JSON' : 'XML'
                },
                large: {
                    json: `${json.rendering.large.renderTime.toFixed(2)}ms`,
                    xml: `${xml.rendering.large.renderTime.toFixed(2)}ms`,
                    winner: json.rendering.large.renderTime < xml.rendering.large.renderTime ? 'JSON' : 'XML'
                }
            },
            interaction: {
                averageResponse: `${this.results.interaction.averageClickResponse.toFixed(2)}ms`,
                rating: this.results.interaction.averageClickResponse < 10 ? '优秀' : 
                       this.results.interaction.averageClickResponse < 50 ? '良好' : '需要优化'
            },
            memory: this.results.memoryUsage ? {
                used: `${(this.results.memoryUsage.difference / 1024 / 1024).toFixed(2)}MB`,
                rating: this.results.memoryUsage.difference < 5 * 1024 * 1024 ? '优秀' : 
                       this.results.memoryUsage.difference < 20 * 1024 * 1024 ? '良好' : '需要优化'
            } : '不支持内存监控'
        };
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceTester;
} else {
    window.PerformanceTester = PerformanceTester;
} 