import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

/**
 * SectionLoader
 *
 * Renders a grid of animated skeleton cards to fill the space while a
 * dashboard section is fetching data from the API.
 *
 * Props:
 *   count    – number of skeleton cards to show (default 3)
 *   columns  – MUI Grid xs/sm/md column config (default { xs: 12, sm: 6, md: 4 })
 *   height   – skeleton card body height in px (default 120)
 *   sx       – extra styles on the wrapper Box
 */
const SectionLoader = ({
  count = 3,
  columns = { xs: 12, sm: 6, md: 4 },
  height = 120,
  sx = {},
}) => (
  <Box sx={sx}>
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item key={i} {...columns}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <CardContent>
              {/* Title line */}
              <Skeleton
                variant="text"
                width="60%"
                height={28}
                sx={{ mb: 1, borderRadius: 1 }}
              />
              {/* Subtitle line */}
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ mb: 2, borderRadius: 1 }}
              />
              {/* Body block */}
              <Skeleton
                variant="rectangular"
                width="100%"
                height={height}
                sx={{ borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

/**
 * StatCardLoader
 *
 * Variant specifically shaped like a stats / KPI card row —
 * single row of wide-short skeleton cards.
 *
 * Props:
 *   count – number of stat cards (default 4)
 */
export const StatCardLoader = ({ count = 4 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item key={i} xs={12} sm={6} md={3}>
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: '1px solid #E2E8F0', p: 0.5 }}
        >
          <CardContent>
            <Skeleton variant="circular" width={44} height={44} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="50%" height={36} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={20} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

/**
 * TableLoader
 *
 * Skeleton rows for a data table section.
 *
 * Props:
 *   rows    – number of skeleton rows (default 5)
 *   columns – number of columns to simulate (default 4)
 */
export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <Box>
    {/* Header */}
    <Box sx={{ display: 'flex', gap: 2, mb: 1, px: 1 }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={24} />
      ))}
    </Box>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          gap: 2,
          px: 1,
          py: 1.5,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton
            key={j}
            variant="text"
            width={`${100 / columns}%`}
            height={20}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

export default SectionLoader;
