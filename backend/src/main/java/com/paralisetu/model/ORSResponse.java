package com.paralisetu.model;

public class ORSResponse {
    private Feature[] features;

    public Feature[] getFeatures() { return features; }
    public void setFeatures(Feature[] features) { this.features = features; }

    public static class Feature {
        private Properties properties;
        private Geometry geometry;

        public Properties getProperties() { return properties; }
        public void setProperties(Properties properties) { this.properties = properties; }

        public Geometry getGeometry() { return geometry; }
        public void setGeometry(Geometry geometry) { this.geometry = geometry; }
    }

    public static class Properties {
        private Segment[] segments;

        public Segment[] getSegments() { return segments; }
        public void setSegments(Segment[] segments) { this.segments = segments; }
    }

    public static class Segment {
        private double distance; // distance in meters
        private double duration; // duration in seconds

        public double getDistance() { return distance; }
        public void setDistance(double distance) { this.distance = distance; }

        public double getDuration() { return duration; }
        public void setDuration(double duration) { this.duration = duration; }
    }

    public static class Geometry {
        private String type;
        private double[][] coordinates; // array of [lon, lat] pairs

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public double[][] getCoordinates() { return coordinates; }
        public void setCoordinates(double[][] coordinates) { this.coordinates = coordinates; }
    }
}