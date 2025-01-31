import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Avatar,
  Link
} from '@mui/material';
import { CloudOutlined, GitHub, LinkedIn } from '@mui/icons-material';

function About() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CloudOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            About SkyWatch
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your Personal Weather Companion
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Our Mission
            </Typography>
            <Typography paragraph>
              SkyWatch aims to provide accurate, real-time weather information in an intuitive and 
              user-friendly interface. We believe that accessing weather data should be simple and 
              beautiful.
            </Typography>
            <Typography paragraph>
              Built with modern web technologies, SkyWatch offers features like current weather 
              conditions, 5-day forecasts, air quality information, and detailed weather maps.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Features
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              {[
                'Real-time weather updates',
                'Five-day weather forecast',
                'Air quality monitoring',
                'Interactive weather maps',
                'Sunrise and sunset times',
                'Favorite locations management',
                'Dark/Light theme support'
              ].map((feature) => (
                <li key={feature}>
                  <Typography paragraph>{feature}</Typography>
                </li>
              ))}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Technology Stack
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: 'React', description: 'Frontend library' },
              { name: 'TypeScript', description: 'Type-safe JavaScript' },
              { name: 'Material UI', description: 'UI component library' },
              { name: 'Open-Meteo API', description: 'Weather data provider' }
            ].map((tech) => (
              <Grid item xs={12} sm={6} md={3} key={tech.name}>
                <Card sx={{ height: '100%', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {tech.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tech.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Connect With Us
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Link
              href="https://github.com/yourusername/skywatch"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'text.primary' }}
            >
              <GitHub sx={{ fontSize: 40 }} />
            </Link>
            <Link
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'text.primary' }}
            >
              <LinkedIn sx={{ fontSize: 40 }} />
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default About; 