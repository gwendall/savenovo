import styled from "styled-components";
import React from "react";

const StyledLink = styled.a``;

const ExternalLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = (props) => (
  <StyledLink target="_blank" rel="noreferrer" {...props} />
);

export default ExternalLink;
