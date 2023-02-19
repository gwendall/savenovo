import React from 'react';
import styled from 'styled-components';

const ContainerBlock = styled.div`
  display: block;
`;

const Container = styled.div<{ ratio: number; }>`
  height: 0;
  position: relative;
  width: 100%;
  padding-top: ${({ ratio }) => (ratio === 0 ? 100 : 100 / ratio)}%;
`;

const Content = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

type RatioBoxProps = {
  ratio?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const RatioBox = React.forwardRef<HTMLDivElement, RatioBoxProps>(({
  ratio = 1,
  children,
  ...restProps
}, ref) => (
  <ContainerBlock { ...restProps } ref={ ref }>
    <Container ratio={ ratio }>
      <Content>
        { children }
      </Content>
    </Container>
  </ContainerBlock>
));
RatioBox.displayName = 'RatioBox';

export default RatioBox;
