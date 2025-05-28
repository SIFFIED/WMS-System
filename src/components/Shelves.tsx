import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { ShelfDetail, ShelfPosition, ShelfLayer } from '../types/warehouse';
import { fetchShelfDetail } from '../services/api';
import { Tooltip } from 'antd';

interface ShelvesProps {
  warehouseId: string;
  shelfId: string;
  onPositionClick: (layerId: string, positionId: string) => void;
  onBack: () => void;
  refreshKey?: number;
  onError?: () => void;
}

const Shelves: React.FC<ShelvesProps> = ({ warehouseId, shelfId, onPositionClick, onBack, refreshKey, onError }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [shelfDetail, setShelfDetail] = useState<ShelfDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clickLock, setClickLock] = useState(false);

  // 使用useCallback包装点击事件处理函数
  const handlePositionClick = useCallback((layerId: string, positionId: string) => {
    // 如果点击被锁定，则不处理
    if (clickLock) return;

    // 锁定点击，防止多次触发
    setClickLock(true);

    // 调用父组件的点击处理函数
    onPositionClick(layerId, positionId);

    // 300ms后解锁，防止频繁点击
    setTimeout(() => {
      setClickLock(false);
    }, 300);
  }, [onPositionClick, clickLock]);

  useEffect(() => {
    const loadShelfDetail = async () => {
      setLoading(true);
      setError(false);
      try {
        console.log('Shelves: 开始加载货架详情', warehouseId, shelfId, refreshKey);
        // 使用API获取货架详情，不再本地生成随机数据
        const data = await fetchShelfDetail(warehouseId, shelfId);
        console.log('Shelves: 货架详情加载成功', data);

        // 验证数据完整性
        if (!data || !data.id || !data.layers || !Array.isArray(data.layers)) {
          console.error('Shelves: 货架详情数据不完整', data);
          throw new Error('货架详情数据不完整');
        }

        setShelfDetail(data);
        setLoading(false);
      } catch (error) {
        console.error('Shelves: 加载货架详情失败:', error);
        setError(true);
        setLoading(false);
        if (onError) {
          onError();
        }
      }
    };

    loadShelfDetail();
  }, [warehouseId, shelfId, refreshKey, onError]);

  useEffect(() => {
    if (!shelfDetail || !svgRef.current) {
      console.log('Shelves: 无数据或SVG引用无效，跳过渲染');
      return;
    }

    try {
      console.log('Shelves: 开始渲染货架详情');
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

      // 绘制货架层
      if (Array.isArray(shelfDetail.layers)) {
        shelfDetail.layers.forEach((layer, layerIndex) => {
          if (!layer || !layer.id || !Array.isArray(layer.positions)) {
            console.warn('Shelves: 无效的层数据，跳过:', layer);
            return;
          }

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
            if (!position || !position.id) {
              console.warn('Shelves: 无效的库位数据，跳过:', position);
              return;
            }

            const posGroup = layerGroup
              .append('g')
              .attr('transform', `translate(${posIndex * positionWidth}, 0)`)
              .attr('cursor', 'pointer')
              .on('click', (event) => {
                // 阻止事件冒泡和默认行为，防止SVG缩放
                event.preventDefault();
                event.stopPropagation();
                // 使用包装后的处理函数
                handlePositionClick(layer.id, position.id);
              });

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
              .attr('y', (layerHeight - 10) / 2 - 10) // 上移一点，为ID留出空间
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '16px')
              .attr('fill', position.hasItems ? 'white' : '#666') // 有物品时文字为白色，无物品时为灰色
              .text(position.name);

            // 如果有真实ID，显示它
            if (position.realId) {
              posGroup
                .append('text')
                .attr('x', (positionWidth - 10) / 2)
                .attr('y', (layerHeight - 10) / 2 + 15) // 下移一点，在位置编号下方
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '10px')
                .attr('fill', position.hasItems ? 'rgba(255,255,255,0.8)' : '#999')
                .text(`ID: ${position.realId.substring(0, 6)}...`); // 只显示ID的前6位
            }
          });
        });
      } else {
        console.error('Shelves: 层数据不是数组:', shelfDetail.layers);
      }

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

      console.log('Shelves: 货架详情渲染完成');
    } catch (renderError) {
      console.error('Shelves: 渲染过程发生错误:', renderError);
      setError(true);

      // 尝试显示错误信息
      try {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const errorMsg = svg
          .append('g')
          .attr('transform', 'translate(375, 275)');

        errorMsg
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', '18px')
          .attr('fill', 'red')
          .text('货架详情渲染失败，请点击导航栏"仓库地图"返回');

        if (onError) {
          onError();
        }
      } catch (e) {
        console.error('Shelves: 显示错误信息也失败了:', e);
      }
    }
  }, [shelfDetail, handlePositionClick, onError]);

  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  if (error && !loading) {
    return (
      <div className="error-container">
        <h3>加载货架详情失败</h3>
        <p>请点击导航栏"仓库地图"按钮返回</p>
      </div>
    );
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
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
};

export default Shelves; 