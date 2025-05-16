import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { WarehouseMap as WarehouseMapType } from '../types/warehouse';
import { fetchWarehouseMap } from '../services/api';

interface WarehouseMapProps {
  onShelfClick: (shelfId: string) => void;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({ onShelfClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [warehouseData, setWarehouseData] = useState<WarehouseMapType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWarehouseMap();
        setWarehouseData(data);
      } catch (error) {
        console.error('加载仓库数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

    // 添加提示信息
    warehouse
      .append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.top)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('点击货架查看详情');

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

    // 绘制外边框
    warehouse
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', areaDX + areaDWidth + 50)
      .attr('height', Math.max(areaAHeight, areaBHeight, areaDHeight) + 120)
      .attr('fill', 'none')
      .attr('stroke', '#d9d9d9')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5');

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
      .text('公物仓（一）');

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

    // 添加货架说明
    warehouse
      .append('text')
      .attr('x', 20)
      .attr('y', Math.max(areaAHeight, areaBHeight, areaDHeight) + 140)
      .attr('font-size', '12px')
      .text('备注: 每个库位为一个货架，本库共计 50 个货架，所有货架均为四层货架，货架每层分三个库位号。');

  }, [warehouseData, onShelfClick]);

  const getShelfColor = (status?: string) => {
    switch (status) {
      case 'danger':
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      case 'normal':
      default:
        return '#1890ff';
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
        viewBox="0 0 850 650"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default WarehouseMap; 