import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { WarehouseMap as WarehouseMapType } from '../types/warehouse';
import { fetchWarehouseMap } from '../services/api';

interface WarehouseMapProps {
  warehouseId: string;
  onShelfClick: (shelfId: string) => void;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({ warehouseId, onShelfClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [warehouseData, setWarehouseData] = useState<WarehouseMapType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchWarehouseMap(warehouseId);
        setWarehouseData(data);
      } catch (error) {
        console.error('加载仓库数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [warehouseId]);

  useEffect(() => {
    if (!warehouseData || !svgRef.current) return;

    // 清空SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 设置基本参数
    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 30, bottom: 50, left: 30 };
    const shelfWidth = 50;
    const shelfHeight = 30;
    const areaGap = 100; // 各区域之间的间隔
    const aisleWidth = 30; // 通道宽度

    // 创建仓库容器
    const warehouse = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 添加仓库标题
    warehouse
      .append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('仓库平面图');

    // 根据仓库ID决定绘制哪种布局
    if (warehouseId === 'warehouse1') {
      drawWarehouse1Layout(warehouse, warehouseData, shelfWidth, shelfHeight, areaGap, width, height, margin);
    } else if (warehouseId === 'warehouse2') {
      drawWarehouse2Layout(warehouse, warehouseData, shelfWidth, shelfHeight, areaGap, width, height, margin);
    }

    // 添加图例
    const legendX = warehouseId === 'warehouse1'
      ? width - margin.left - margin.right + 50
      : width - margin.left - margin.right + 30;

    const legend = warehouse
      .append('g')
      .attr('transform', `translate(${legendX}, ${50})`);

    // 图例标题
    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('图例说明');

    // 图例项
    const legendItems = [
      { color: '#d9d9d9', text: '空货架 - 没有物品' },
      { color: '#1890ff', text: '有1层存放物品' },
      { color: '#52c41a', text: '有2层存放物品' },
      { color: '#faad14', text: '有3层存放物品' },
      { color: '#ff4d4f', text: '全部4层都有物品' }
    ];

    legendItems.forEach((item, index) => {
      const itemG = legend
        .append('g')
        .attr('transform', `translate(0, ${20 + index * 25})`);

      // 图例颜色方块
      itemG
        .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color)
        .attr('stroke', '#595959')
        .attr('stroke-width', 1);

      // 图例文字
      itemG
        .append('text')
        .attr('x', 25)
        .attr('y', 12)
        .attr('font-size', '12px')
        .text(item.text);
    });
  }, [warehouseData, onShelfClick, warehouseId]);

  // 绘制公物仓一布局
  const drawWarehouse1Layout = (warehouse: d3.Selection<SVGGElement, unknown, null, undefined>,
    warehouseData: WarehouseMapType,
    shelfWidth: number,
    shelfHeight: number,
    areaGap: number,
    width: number,
    height: number,
    margin: { top: number, right: number, bottom: number, left: number }) => {
    // 计算A区域位置
    const areaAX = 50;
    const areaAY = 50;
    const areaAWidth = shelfWidth;
    const areaAHeight = warehouseData.shelves.a.length * shelfHeight;

    // 计算B和C区域位置
    const areaBCX = areaAX + areaAWidth + areaGap;
    const areaBCY = areaAY;
    const areaBWidth = shelfWidth;
    const areaBHeight = warehouseData.shelves.b.length * shelfHeight;
    const areaCWidth = shelfWidth;
    const areaCHeight = warehouseData.shelves.c.length * shelfHeight;

    // 计算D区域位置
    const areaDX = areaBCX + areaBWidth + areaCWidth + areaGap;
    const areaDY = areaAY;
    const areaDWidth = shelfWidth;
    const areaDHeight = warehouseData.shelves.d.length * shelfHeight;

    // 绘制通道标签
    // 顶部通道
    warehouse
      .append('text')
      .attr('x', (areaDX + areaDWidth) / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 左边通道
    warehouse
      .append('text')
      .attr('x', areaAX + areaAWidth + areaGap / 2)
      .attr('y', areaAY + areaAHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 右边通道
    warehouse
      .append('text')
      .attr('x', areaBCX + areaBWidth + areaCWidth + areaGap / 2)
      .attr('y', areaDY + areaDHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 底部通道
    warehouse
      .append('text')
      .attr('x', (areaDX + areaDWidth) / 2)
      .attr('y', Math.max(areaAHeight, areaBHeight, areaDHeight) + 70)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 绘制入口
    warehouse
      .append('rect')
      .attr('x', (areaDX + areaDWidth) / 2 - 40)
      .attr('y', Math.max(areaAHeight, areaBHeight, areaDHeight) + 90)
      .attr('width', 80)
      .attr('height', 20)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#d9d9d9');

    warehouse
      .append('text')
      .attr('x', (areaDX + areaDWidth) / 2)
      .attr('y', Math.max(areaAHeight, areaBHeight, areaDHeight) + 105)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('门');

    // 仓库名称
    warehouse
      .append('text')
      .attr('x', (areaDX + areaDWidth) / 2)
      .attr('y', Math.max(areaAHeight, areaBHeight, areaDHeight) + 140)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(warehouseData.name);

    // 绘制A区域货架
    const areaA = warehouse
      .append('g')
      .attr('transform', `translate(${areaAX}, ${areaAY})`);

    warehouseData.shelves.a.forEach((shelf, index) => {
      const shelfG = areaA
        .append('g')
        .attr('transform', `translate(0, ${index * shelfHeight})`)
        .attr('cursor', 'pointer')
        .on('click', () => onShelfClick(shelf.id));

      shelfG
        .append('rect')
        .attr('width', shelfWidth)
        .attr('height', shelfHeight - 2)
        .attr('fill', getShelfColor(shelf.status))
        .attr('stroke', '#595959')
        .attr('stroke-width', 1);

      shelfG
        .append('text')
        .attr('x', shelfWidth / 2)
        .attr('y', (shelfHeight - 2) / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text(shelf.name);
    });

    // 绘制B区域货架
    const areaB = warehouse
      .append('g')
      .attr('transform', `translate(${areaBCX}, ${areaBCY})`);

    warehouseData.shelves.b.forEach((shelf, index) => {
      const shelfG = areaB
        .append('g')
        .attr('transform', `translate(0, ${index * shelfHeight})`)
        .attr('cursor', 'pointer')
        .on('click', () => onShelfClick(shelf.id));

      shelfG
        .append('rect')
        .attr('width', shelfWidth)
        .attr('height', shelfHeight - 2)
        .attr('fill', getShelfColor(shelf.status))
        .attr('stroke', '#595959')
        .attr('stroke-width', 1);

      shelfG
        .append('text')
        .attr('x', shelfWidth / 2)
        .attr('y', (shelfHeight - 2) / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text(shelf.name);
    });

    // 绘制C区域货架
    const areaC = warehouse
      .append('g')
      .attr('transform', `translate(${areaBCX + shelfWidth}, ${areaBCY})`);

    warehouseData.shelves.c.forEach((shelf, index) => {
      const shelfG = areaC
        .append('g')
        .attr('transform', `translate(0, ${index * shelfHeight})`)
        .attr('cursor', 'pointer')
        .on('click', () => onShelfClick(shelf.id));

      shelfG
        .append('rect')
        .attr('width', shelfWidth)
        .attr('height', shelfHeight - 2)
        .attr('fill', getShelfColor(shelf.status))
        .attr('stroke', '#595959')
        .attr('stroke-width', 1);

      shelfG
        .append('text')
        .attr('x', shelfWidth / 2)
        .attr('y', (shelfHeight - 2) / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text(shelf.name);
    });

    // 绘制D区域货架
    const areaD = warehouse
      .append('g')
      .attr('transform', `translate(${areaDX}, ${areaDY})`);

    warehouseData.shelves.d.forEach((shelf, index) => {
      const shelfG = areaD
        .append('g')
        .attr('transform', `translate(0, ${index * shelfHeight})`)
        .attr('cursor', 'pointer')
        .on('click', () => onShelfClick(shelf.id));

      shelfG
        .append('rect')
        .attr('width', shelfWidth)
        .attr('height', shelfHeight - 2)
        .attr('fill', getShelfColor(shelf.status))
        .attr('stroke', '#595959')
        .attr('stroke-width', 1);

      shelfG
        .append('text')
        .attr('x', shelfWidth / 2)
        .attr('y', (shelfHeight - 2) / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text(shelf.name);
    });
  };

  // 绘制公物仓二布局
  const drawWarehouse2Layout = (warehouse: d3.Selection<SVGGElement, unknown, null, undefined>,
    warehouseData: WarehouseMapType,
    shelfWidth: number,
    shelfHeight: number,
    areaGap: number,
    width: number,
    height: number,
    margin: { top: number, right: number, bottom: number, left: number }) => {
    // 绘制仓库外框
    const warehouseWidth = 650;
    const warehouseHeight = 450;
    const warehouseX = 20;
    const warehouseY = 20;

    // 计算家具区域位置和大小
    const furnitureWidth = 150;
    const furnitureHeight = 250;
    const furnitureLeftX = warehouseX + 100;
    const furnitureLeftY = warehouseY + 100;
    const furnitureRightX = furnitureLeftX + furnitureWidth + 80; // 中间通道
    const furnitureRightY = furnitureLeftY;

    // 计算F区货架位置（右侧纵向排列 - F16A、F16B、F16C、F16D）
    const areaFX = warehouseX + warehouseWidth - 50;
    const areaFY = warehouseY + 70;
    const fShelfWidth = 30;
    const fShelfHeight = 30;

    // 计算R区货架位置（左侧纵向排列 - F18A、F18B、F14、F13）
    const areaRX = warehouseX + 20;
    const areaRY = warehouseY + 70;
    const rShelfWidth = 30;
    const rShelfHeight = 30;

    // 绘制通道标签
    // 顶部通道
    warehouse
      .append('text')
      .attr('x', warehouseX + warehouseWidth / 2)
      .attr('y', warehouseY + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 左边通道
    warehouse
      .append('text')
      .attr('x', areaRX + 50)
      .attr('y', warehouseY + warehouseHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 右边通道
    warehouse
      .append('text')
      .attr('x', areaFX - 70)
      .attr('y', warehouseY + warehouseHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 中间通道
    warehouse
      .append('text')
      .attr('x', (furnitureLeftX + furnitureWidth + furnitureRightX) / 2)
      .attr('y', furnitureLeftY + furnitureHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 底部通道
    warehouse
      .append('text')
      .attr('x', warehouseX + warehouseWidth / 4 - 10)
      .attr('y', warehouseY + warehouseHeight - 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    warehouse
      .append('text')
      .attr('x', warehouseX + warehouseWidth * 3 / 4 + 10)
      .attr('y', warehouseY + warehouseHeight - 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('通道');

    // 绘制入口
    warehouse
      .append('rect')
      .attr('x', warehouseX + warehouseWidth / 2 - 40)
      .attr('y', warehouseY + warehouseHeight - 20)
      .attr('width', 80)
      .attr('height', 20)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#d9d9d9');

    warehouse
      .append('text')
      .attr('x', warehouseX + warehouseWidth / 2)
      .attr('y', warehouseY + warehouseHeight - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('门');

    // 绘制家具区
    // 左侧家具区
    warehouse
      .append('rect')
      .attr('x', furnitureLeftX)
      .attr('y', furnitureLeftY)
      .attr('width', furnitureWidth)
      .attr('height', furnitureHeight)
      .attr('fill', 'none')
      .attr('stroke', '#d9d9d9')
      .attr('stroke-width', 1);

    warehouse
      .append('text')
      .attr('x', furnitureLeftX + furnitureWidth / 2)
      .attr('y', furnitureLeftY + furnitureHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('家具区（左）');

    // 右侧家具区
    warehouse
      .append('rect')
      .attr('x', furnitureRightX)
      .attr('y', furnitureRightY)
      .attr('width', furnitureWidth)
      .attr('height', furnitureHeight)
      .attr('fill', 'none')
      .attr('stroke', '#d9d9d9')
      .attr('stroke-width', 1);

    warehouse
      .append('text')
      .attr('x', furnitureRightX + furnitureWidth / 2)
      .attr('y', furnitureRightY + furnitureHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('家具区（右）');

    // 仓库名称
    warehouse
      .append('text')
      .attr('x', warehouseX + warehouseWidth / 2)
      .attr('y', warehouseY + warehouseHeight + 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(warehouseData.name);

    // 绘制右侧货架 - F16A、F16B、F16C、F16D
    if (warehouseData.shelves.f && warehouseData.shelves.f.length > 0) {
      const areaF = warehouse.append('g');

      // 绘制F16A、F16B、F16C、F16D从上到下排列
      warehouseData.shelves.f.forEach((shelf, index) => {
        const shelfG = areaF
          .append('g')
          .attr('transform', `translate(${areaFX}, ${areaFY + index * fShelfHeight * 2})`)
          .attr('cursor', 'pointer')
          .on('click', () => onShelfClick(shelf.id));

        // 使用与公物仓一相同的货架样式
        shelfG
          .append('rect')
          .attr('width', fShelfWidth - 2)
          .attr('height', fShelfHeight - 2)
          .attr('fill', getShelfColor(shelf.status))
          .attr('stroke', '#595959')
          .attr('stroke-width', 1);

        shelfG
          .append('text')
          .attr('x', (fShelfWidth - 2) / 2)
          .attr('y', (fShelfHeight - 2) / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12px')
          .attr('fill', 'white')
          .text(shelf.name);
      });
    }

    // 绘制左侧货架 - F18A、F18B、F14、F13
    if (warehouseData.shelves.r && warehouseData.shelves.r.length > 0) {
      const areaR = warehouse.append('g');

      // 按照从上到下的顺序绘制：F18A、F18B、F14、F13
      warehouseData.shelves.r.forEach((shelf, index) => {
        const shelfG = areaR
          .append('g')
          .attr('transform', `translate(${areaRX}, ${areaRY + index * rShelfHeight * 2})`)
          .attr('cursor', 'pointer')
          .on('click', () => onShelfClick(shelf.id));

        // 使用与公物仓一相同的货架样式
        shelfG
          .append('rect')
          .attr('width', rShelfWidth - 2)
          .attr('height', rShelfHeight - 2)
          .attr('fill', getShelfColor(shelf.status))
          .attr('stroke', '#595959')
          .attr('stroke-width', 1);

        shelfG
          .append('text')
          .attr('x', (rShelfWidth - 2) / 2)
          .attr('y', (rShelfHeight - 2) / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12px')
          .attr('fill', 'white')
          .text(shelf.name);
      });
    }
  };

  const getShelfColor = (status?: string) => {
    switch (status) {
      case 'empty':
        return '#d9d9d9'; // 灰色 - 货架的每一层都没物品
      case 'first':
        return '#1890ff'; // 蓝色 - 货架的第一层有物品
      case 'second':
        return '#52c41a'; // 绿色 - 货架的第二层有物品
      case 'third':
        return '#faad14'; // 黄色 - 货架的第三层有物品
      case 'fourth':
        return '#ff4d4f'; // 红色 - 货架的第四层有物品
      default:
        return '#d9d9d9'; // 默认灰色
    }
  };

  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  return (
    <div className="warehouse-map-container">
      <svg
        ref={svgRef}
        width="100%"
        height="650"
        viewBox="0 0 950 650"
        preserveAspectRatio="xMidYMid meet"
        className="responsive-svg"
      />
    </div>
  );
};

export default WarehouseMap; 