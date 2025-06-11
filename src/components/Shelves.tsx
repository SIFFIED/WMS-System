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
  const [internalRefreshKey, setInternalRefreshKey] = useState(0); // 内部刷新键

  // 使用useCallback包装点击事件处理函数
  const handlePositionClick = useCallback((layerId: string, positionId: string, event?: { clientX: number; clientY: number }) => {
    // 如果点击被锁定，则不处理
    if (clickLock) return;

    // 锁定点击，防止多次触发
    setClickLock(true);

    // 创建点击反馈效果
    if (svgRef.current && event) {
      const svg = d3.select(svgRef.current);
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = event.clientX - svgRect.left;
      const y = event.clientY - svgRect.top;

      const clickFeedback = svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 0)
        .attr('fill', 'rgba(24, 144, 255, 0.5)')
        .attr('stroke', '#1890ff')
        .attr('stroke-width', 2)
        .style('pointer-events', 'none');

      clickFeedback
        .transition()
        .duration(200)
        .attr('r', 40)
        .style('opacity', 0)
        .remove();
    }

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

      // 获取SVG容器的当前尺寸
      const svgContainer = svgRef.current.parentElement;
      const containerWidth = svgContainer ? svgContainer.clientWidth : 1200;
      const containerHeight = svgContainer ? svgContainer.clientHeight : 750;

      // 基于容器尺寸计算渲染参数
      const width = Math.min(1200, containerWidth * 0.9);
      const height = Math.min(750, containerHeight * 0.9);
      const layerHeight = height * 0.18; // 大约是总高度的18%
      const layerGap = height * 0.02; // 大约是总高度的2%
      const positionWidth = width * 0.22; // 大约是总宽度的22%
      const positionGap = width * 0.01; // 大约是总宽度的1%
      const margin = {
        top: height * 0.1,
        right: width * 0.04,
        bottom: height * 0.04,
        left: width * 0.08
      };

      // 更新SVG视图框以匹配容器尺寸
      svg.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

      // 创建货架框架
      const shelf = svg
        .append('g')
        .attr('transform', `translate(${(containerWidth - width) / 2 + margin.left}, ${margin.top})`);

      // 创建标题渐变
      const titleGradientId = 'title-gradient';
      const titleGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", titleGradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      titleGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#1890ff");

      titleGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#096dd9");

      // 绘制标题
      shelf
        .append('text')
        .attr('x', width / 2 - margin.left)
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '34px')
        .attr('font-weight', 'bold')
        .attr('fill', `url(#${titleGradientId})`)
        .attr('filter', 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))')
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
            .attr('transform', `translate(0, ${layerIndex * (layerHeight + layerGap)})`);

          // 层标签
          layerGroup
            .append('text')
            .attr('x', -50)
            .attr('y', layerHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-weight', 'bold')
            .attr('font-size', '22px')
            .text(`层${layerIndex + 1}`);

          // 绘制每个层的位置
          layer.positions.forEach((position, posIndex) => {
            if (!position || !position.id) {
              console.warn('Shelves: 无效的库位数据，跳过:', position);
              return;
            }

            // 是否是3号位置
            const isPosition3 = position.name === '3';

            // 使用positionGap计算每个库位的水平位置，减少水平间距
            const posGroup = layerGroup
              .append('g')
              .attr('transform', `translate(${posIndex * (positionWidth + positionGap)}, 0)`)
              .attr('cursor', 'pointer')
              .on('click', function (event) {
                // 阻止事件冒泡和默认行为，防止SVG缩放
                event.preventDefault();
                event.stopPropagation();

                // 获取点击坐标作为参数传递
                const coords = {
                  clientX: event.clientX,
                  clientY: event.clientY
                };

                // 使用包装后的处理函数
                handlePositionClick(layer.id, position.id, coords);
              });

            // 创建渐变
            const gradientId = `gradient-${layerIndex}-${posIndex}`;
            const gradient = svg.append("defs")
              .append("linearGradient")
              .attr("id", gradientId)
              .attr("x1", "0%")
              .attr("y1", "0%")
              .attr("x2", "100%")
              .attr("y2", "100%");

            if (position.hasItems) {
              // 有物品时的渐变色 - 蓝色渐变
              gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#1890ff");

              gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#0050b3");
            } else {
              // 无物品时的渐变色 - 灰色渐变
              gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#f5f5f5");

              gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#e8e8e8");
            }

            // 位置框 - 统一样式，不为3号位置添加特殊效果
            const boxElement = posGroup
              .append('rect')
              .attr('width', positionWidth - 20)
              .attr('height', layerHeight - 20)
              .attr('rx', 12)
              .attr('fill', `url(#${gradientId})`)
              .attr('stroke', '#d9d9d9')
              .attr('stroke-width', 2);

            // 位置编号 - 统一样式，调整垂直位置
            posGroup
              .append('text')
              .attr('x', (positionWidth - 20) / 2)
              .attr('y', (layerHeight - 20) / 2 - 12)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '28px')
              .attr('font-weight', 'normal')
              .attr('fill', position.hasItems ? 'white' : '#666')
              .text(position.name);

            // 如果有真实ID，显示它，调整垂直位置
            if (position.realId) {
              posGroup
                .append('text')
                .attr('x', (positionWidth - 20) / 2)
                .attr('y', (layerHeight - 20) / 2 + 16)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '16px')
                .attr('fill', position.hasItems ? 'rgba(255,255,255,0.8)' : '#999')
                .text(`ID: ${position.realId.substring(0, 6)}...`);
            }
          });
        });
      } else {
        console.error('Shelves: 层数据不是数组:', shelfDetail.layers);
      }

      // 计算图例尺寸，基于容器宽度
      const legendWidth = Math.max(140, containerWidth * 0.12); // 图例宽度
      const legendHeight = Math.max(120, containerHeight * 0.2); // 图例高度
      const legendFontSize = Math.max(16, containerWidth * 0.012); // 图例标题字体大小
      const legendItemFontSize = Math.max(14, containerWidth * 0.01); // 图例项目字体大小
      const legendItemSize = Math.max(30, containerWidth * 0.02); // 图例项目方块大小

      // 添加图例
      const legend = svg
        .append('g')
        .attr('transform', `translate(${containerWidth - margin.right - legendWidth - 20}, ${margin.top})`); // 移动到右上方

      // 创建模糊滤镜
      const blurFilter = svg.append("defs")
        .append("filter")
        .attr("id", "legend-blur")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      blurFilter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "3");

      // 创建图例背景
      legend
        .append('rect')
        .attr('x', -20)
        .attr('y', -20)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'rgba(255, 255, 255, 0.6)') // 更高透明度
        .attr('rx', 10)
        .attr('stroke', 'none')
        .attr('stroke-width', 0)
        .attr('filter', 'url(#legend-blur)'); // 应用模糊效果

      // 图例标题
      legend
        .append('text')
        .attr('x', legendWidth / 2 - 20)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', `${legendFontSize}px`)
        .attr('font-weight', 'bold')
        .attr('fill', '#1890ff')
        .attr('filter', 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))') // 添加轻微文字阴影
        .text('库位状态');

      // 图例项
      const legendItems = [
        { color: '#1890ff', gradient: ['#1890ff', '#0050b3'], text: '有物品' },
        { color: '#f0f0f0', gradient: ['#f5f5f5', '#e8e8e8'], text: '无物品' }
      ];

      legendItems.forEach((item, index) => {
        // 创建图例项渐变
        const legendGradientId = `legend-gradient-${index}`;
        const legendGradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", legendGradientId)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "100%");

        legendGradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", item.gradient[0]);

        legendGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", item.gradient[1]);

        const itemG = legend
          .append('g')
          .attr('transform', `translate(${legendWidth / 2 - legendItemSize - 10}, ${50 + index * (legendItemSize + 20)})`);

        // 图例颜色方块
        itemG
          .append('rect')
          .attr('width', legendItemSize)
          .attr('height', legendItemSize)
          .attr('fill', `url(#${legendGradientId})`)
          .attr('stroke', 'none')
          .attr('stroke-width', 0)
          .attr('rx', 8)
          .attr('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))'); // 添加轻微阴影

        // 图例文字
        itemG
          .append('text')
          .attr('x', legendItemSize + 15)
          .attr('y', legendItemSize / 2)
          .attr('dominant-baseline', 'middle')
          .attr('font-size', `${legendItemFontSize}px`)
          .attr('fill', index === 0 ? '#1890ff' : '#666') // 修正：第一项是蓝色（有物品）
          .attr('filter', 'drop-shadow(0px 1px 1px rgba(0,0,0,0.05))') // 添加轻微文字阴影
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
  }, [shelfDetail, handlePositionClick, onError, internalRefreshKey]);

  // 添加全局样式，防止滚动条并确保容器撑满区域
  useEffect(() => {
    // 添加全局样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .shelf-detail-container-parent * {
        overflow: hidden !important;
      }
      
      .shelf-detail-container-parent {
        height: 100% !important;
        min-height: 750px !important;
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
      }
    `;
    document.head.appendChild(styleElement);

    // 找到组件的父元素，添加类名
    if (svgRef.current) {
      const parentElement = svgRef.current.closest('.shelf-detail-container')?.parentElement;
      if (parentElement) {
        parentElement.classList.add('shelf-detail-container-parent');
      }

      // 尝试找到更上层的容器并添加样式
      const grandParent = parentElement?.parentElement;
      if (grandParent) {
        grandParent.style.height = '100%';
        grandParent.style.display = 'flex';
        grandParent.style.flexDirection = 'column';
      }
    }

    // 组件卸载时移除样式
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 添加窗口尺寸变化的监听
  useEffect(() => {
    // 定义重新渲染函数
    const handleResize = () => {
      setInternalRefreshKey(prev => prev + 1); // 通过改变internalRefreshKey来触发重新渲染
    };

    // 添加resize事件监听
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) {
    return (
      <div className="tech-loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '750px',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        background: 'rgba(240, 242, 245, 0.7)',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          border: '6px solid rgba(24, 144, 255, 0.2)',
          borderTop: '6px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '40px'
        }}></div>
        <div style={{
          color: '#1890ff',
          fontSize: '26px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(24, 144, 255, 0.3)'
        }}>
          加载货架数据...
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `
        }} />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="tech-error-container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '750px',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(245, 245, 245, 0.9) 0%, rgba(235, 235, 235, 0.9) 100%)',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        color: '#ff4d4f',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.05)'
      }}>
        <svg viewBox="64 64 896 896" focusable="false" width="120" height="120" fill="#ff4d4f" aria-hidden="true">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
        </svg>
        <h3 style={{ marginTop: '40px', fontSize: '32px', fontWeight: 'bold' }}>加载货架详情失败</h3>
        <p style={{ marginTop: '20px', fontSize: '24px', opacity: 0.8 }}>请点击导航栏"仓库地图"按钮返回</p>
        <button
          onClick={onBack}
          style={{
            marginTop: '50px',
            padding: '15px 30px',
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '22px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 77, 79, 0.2)',
            transition: 'all 0.3s'
          }}
        >
          返回仓库地图
        </button>
      </div>
    );
  }

  return (
    <div
      className="shelf-detail-container"
      style={{
        animation: 'fadeIn 0.3s ease-in-out',
        height: '100%',
        minHeight: '750px',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0.2; }
            to { opacity: 1; }
          }
          
          /* 全局防止滚动条样式 */
          .shelf-detail-container, 
          .tech-loading-container, 
          .tech-error-container,
          .responsive-svg {
            overflow: hidden !important;
          }
        `
      }} />
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1200 750"
        preserveAspectRatio="xMidYMid meet"
        className="responsive-svg"
        style={{
          pointerEvents: 'auto',
          display: 'block',
          margin: '0 auto',
          minHeight: '750px'
        }}
      />
    </div>
  );
};

export default Shelves; 