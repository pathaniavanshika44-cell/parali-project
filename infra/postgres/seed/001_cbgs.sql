
-- Parali-to-CBG Marketplace
-- Real CBG station data supplied by the project owner.
-- Safe to rerun: existing records are updated by source_plant_id.

-- Preserve the original IDs from the source spreadsheet.
ALTER TABLE cbgs
ADD COLUMN IF NOT EXISTS source_plant_id VARCHAR(20);

ALTER TABLE cbgs
ADD COLUMN IF NOT EXISTS entity_name VARCHAR(200);

ALTER TABLE cbgs
ADD COLUMN IF NOT EXISTS district VARCHAR(120);

ALTER TABLE cbgs
ADD COLUMN IF NOT EXISTS feedstock_capacity_tons_per_day NUMERIC(12, 3)
CHECK (
    feedstock_capacity_tons_per_day IS NULL
    OR feedstock_capacity_tons_per_day >= 0
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cbgs_source_plant_id
ON cbgs (source_plant_id);

-- Insert or update the nine supplied CBG stations.
INSERT INTO cbgs (
    source_plant_id,
    name,
    entity_name,
    address,
    district,
    location,
    feedstock_capacity_tons_per_day,
    is_verified,
    is_active
)
VALUES
(
    'Pid01',
    'MITTAL ENTERPRISES',
    'MITTAL ENTERPRISES',
    '1412 Chittauda Mahiuddinpur, Salarpur, Garh Mukteshwar, Uttar Pradesh 245205',
    'Hapur',
    ST_SetSRID(ST_MakePoint(78.0996683779318, 28.7195380266695), 4326)::geography,
    145,
    FALSE,
    TRUE
),
(
    'Pid02',
    'DEGNA BIOENERGY PRIVATE LIMITED',
    'DEGNA BIOENERGY PRIVATE LIMITED',
    'MQPR+MC, Akdauli, Uttar Pradesh 245101',
    'Hapur',
    ST_SetSRID(ST_MakePoint(77.7910478890859, 28.6865947077758), 4326)::geography,
    300,
    FALSE,
    TRUE
),
(
    'Pid03',
    'Hapur CBG Plant',
    'Reliance Industries Limited',
    'PQ39+3R, Chitauli, Uttar Pradesh 245101',
    'Hapur',
    ST_SetSRID(ST_MakePoint(77.7691966292027, 28.7007252251634), 4326)::geography,
    451,
    FALSE,
    TRUE
),
(
    'Pid04',
    'Blue Planet Integrated Waste Management Facility',
    'Blue Planet Environmental Solutions India Pvt. Ltd.',
    'FFGJ+97H, Knowledge Park III, Greater Noida, Uttar Pradesh 201310',
    'Gautam Buddha Nagar',
    ST_SetSRID(ST_MakePoint(77.4807254382863, 28.4759855607493), 4326)::geography,
    20,
    FALSE,
    TRUE
),
(
    'Pid05',
    'ANANDMANGAL INFRADEVELOPERS PRIVATE LIMITED',
    'ANANDMANGAL INFRADEVELOPERS PRIVATE LIMITED',
    'Sakoti, Uttar Pradesh 250223',
    'Meerut',
    ST_SetSRID(ST_MakePoint(77.7243226712473, 29.1826762524094), 4326)::geography,
    445,
    FALSE,
    TRUE
),
(
    'Pid06',
    'CIRCLE CBG INDIA PRIVATE LIMITED',
    'CIRCLE CBG INDIA PRIVATE LIMITED',
    '2WGJ+MF, Bahadurpur, Uttar Pradesh 250402',
    'Meerut',
    ST_SetSRID(ST_MakePoint(77.930681700319, 29.027185919269), 4326)::geography,
    430,
    FALSE,
    TRUE
),
(
    'Pid07',
    'BULAND BIO GAS',
    'BULAND BIO GAS',
    'GVC2+C83, Lahagra, Uttar Pradesh 203408',
    'Bulandshahr',
    ST_SetSRID(ST_MakePoint(77.8507752361591, 28.5211466533399), 4326)::geography,
    70,
    FALSE,
    TRUE
),
(
    'Pid08',
    'Indian Potash Limited, BIO-REFINERY COMPLEX',
    'Indian Potash Limited',
    'Rohana Kalan, Uttar Pradesh 251202',
    'Muzaffarnagar',
    ST_SetSRID(ST_MakePoint(77.6901337020385, 29.5651262548924), 4326)::geography,
    450,
    FALSE,
    TRUE
),
(
    'Pid09',
    'Biospark Energy Pvt Ltd',
    'Biospark Energy Pvt Ltd',
    'Mansurpur, Uttar Pradesh 251203',
    'Muzaffarnagar',
    ST_SetSRID(ST_MakePoint(77.7716815679407, 29.4032912598788), 4326)::geography,
    100,
    FALSE,
    TRUE
)
ON CONFLICT (source_plant_id)
DO UPDATE SET
    name = EXCLUDED.name,
    entity_name = EXCLUDED.entity_name,
    address = EXCLUDED.address,
    district = EXCLUDED.district,
    location = EXCLUDED.location,
    feedstock_capacity_tons_per_day =
        EXCLUDED.feedstock_capacity_tons_per_day;
