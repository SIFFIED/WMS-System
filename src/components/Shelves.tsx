import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Shelf } from '../types/warehouse';

interface ShelfPosition {
  id: string;
  name: string;
}

interface ShelfLayer {
  id: string;
  positions: ShelfPosition[];
}

interface ShelfDetail {
  id: string;
  name: string;
  layers: ShelfLayer[];
}

interface ShelvesProps {
  shelfId: string;
  onPositionClick: (layerId: string, positionId: string) => void;
  onBack: () => void;
}

// 生成货架详情数据
const generateShelfDetail = (shelfId: string): ShelfDetail => {
  const layers = [1, 2, 3, 4].map(layerNum => ({
    id: `${shelfId}-L${layerNum}`,
    positions: [1, 2, 3].map(posNum => ({
      id: `${shelfId}-L${layerNum}-P${posNum}`,
      name: `${posNum}`
    }))
  }));

  return {
    id: shelfId,
    name: shelfId,
    layers
  };
};

const Shelves: React.FC<ShelvesProps> = ({ shelfId, onPositionClick, onBack }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [shelfDetail, setShelfDetail] = useState<ShelfDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShelfDetail = async () => {
      setLoading(true);
      try {
        // 生成货架详情数据代替从服务器获取
        const data = generateShelfDetail(shelfId);
        setShelfDetail(data);
        setLoading(false);
      } catch (error) {
        console.error('加载货架详情失败:', error);
        setLoading(false);
      }
    };

    loadShelfDetail();
  }, [shelfId]);

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
          .attr('fill', '#f0f0f0')
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

    // 添加货架说明
    shelf
      .append('text')
      .attr('x', width / 2 - margin.left)
      .attr('y', layerHeight * 4 + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('每个货架均为四层，货架每层分为三个库位');

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
        viewBox="0 0 650 550"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default Shelves; 