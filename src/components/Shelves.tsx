import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ShelfDetail, ShelfPosition, ShelfLayer } from '../types/warehouse';
import { fetchShelfDetail } from '../services/api';

interface ShelvesProps {
  warehouseId: string;
  shelfId: string;
  onPositionClick: (layerId: string, positionId: string) => void;
  onBack: () => void;
}

const Shelves: React.FC<ShelvesProps> = ({ warehouseId, shelfId, onPositionClick, onBack }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [shelfDetail, setShelfDetail] = useState<ShelfDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShelfDetail = async () => {
      setLoading(true);
      try {
        // 使用API获取货架详情，不再本地生成随机数据
        const data = await fetchShelfDetail(warehouseId, shelfId);
        setShelfDetail(data);
        setLoading(false);
      } catch (error) {
        console.error('加载货架详情失败:', error);
        setLoading(false);
      }
    };

    loadShelfDetail();
  }, [warehouseId, shelfId]);

  useEffect(() => {
    if (!shelfDetail || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 500;
    const layerHeight = 100;
    const positionWidth = 150;
    const margin = { top: 30, right: 20, bottom: 30, left: 50 };

    // 创建货架框架
    const shelf = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 绘制标题
    shelf
      .append('text')
      .attr('x', width / 2 - margin.left)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(`货架 ${shelfDetail.name} (四层货架)`);

    // 绘制返回按钮
    const backButton = shelf
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', onBack);

    backButton
      .append('rect')
      .attr('x', 0)
      .attr('y', -25)
      .attr('width', 60)
      .attr('height', 25)
      .attr('fill', '#1890ff')
      .attr('rx', 4);

    backButton
      .append('text')
      .attr('x', 30)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text('返回');

    // 绘制货架层
    shelfDetail.layers.forEach((layer, layerIndex) => {
      const layerGroup = shelf
        .append('g')
        .attr('transform', `translate(0, ${layerIndex * layerHeight})`);

      // 层标签
      layerGroup
        .append('text')
        .attr('x', -30)
        .attr('y', layerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .text(`层${4 - layerIndex}`);

      // 绘制每个层的位置
      layer.positions.forEach((position, posIndex) => {
        const posGroup = layerGroup
          .append('g')
          .attr('transform', `translate(${posIndex * positionWidth}, 0)`)
          .attr('cursor', 'pointer')
          .on('click', () => onPositionClick(layer.id, position.id));

        // 位置框
        posGroup
          .append('rect')
          .attr('width', positionWidth - 10)
          .attr('height', layerHeight - 10)
          .attr('rx', 4)
          .attr('fill', position.hasItems ? '#1890ff' : '#f0f0f0') // 有物品为蓝色，无物品为灰色
          .attr('stroke', '#d9d9d9')
          .attr('stroke-width', 1);

        // 位置编号
        posGroup
          .append('text')
          .attr('x', (positionWidth - 10) / 2)
          .attr('y', (layerHeight - 10) / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '16px')
          .attr('fill', position.hasItems ? 'white' : '#666') // 有物品时文字为白色，无物品时为灰色
          .text(position.name);
      });
    });

    // 添加货架支撑
    shelf
      .append('rect')
      .attr('x', -10)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', layerHeight * 4)
      .attr('fill', '#8c8c8c');

    shelf
      .append('rect')
      .attr('x', positionWidth * 3)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', layerHeight * 4)
      .attr('fill', '#8c8c8c');

    // 添加底座
    shelf
      .append('rect')
      .attr('x', -10)
      .attr('y', layerHeight * 4)
      .attr('width', positionWidth * 3 + 20)
      .attr('height', 10)
      .attr('fill', '#595959');

    // 添加图例
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width + margin.left}, ${margin.top + 50})`);

    // 图例标题
    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('库位状态图例');

    // 图例项
    const legendItems = [
      { color: '#f0f0f0', text: '无物品' },
      { color: '#1890ff', text: '有物品' }
    ];

    legendItems.forEach((item, index) => {
      const itemG = legend
        .append('g')
        .attr('transform', `translate(0, ${25 + index * 30})`);

      // 图例颜色方块
      itemG
        .append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', item.color)
        .attr('stroke', '#d9d9d9')
        .attr('stroke-width', 1)
        .attr('rx', 4);

      // 图例文字
      itemG
        .append('text')
        .attr('x', 30)
        .attr('y', 15)
        .attr('font-size', '14px')
        .text(item.text);
    });

  }, [shelfDetail, onBack, onPositionClick]);

  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  return (
    <div className="shelf-detail-container">
      <svg
        ref={svgRef}
        width="100%"
        height="550"
        viewBox="0 0 750 550"
        preserveAspectRatio="xMidYMid meet"
        className="responsive-svg"
      />
    </div>
  );
};

export default Shelves; 