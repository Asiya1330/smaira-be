-- Local development seed (trimmed dataset)
BEGIN;

INSERT INTO public.products (
  id, barcode, product_name, brand, category, size_count, absorbency,
  ingredients_list, material_composition, bleaching_method, synthetic_materials,
  preservatives, fragrance_type, antibacterial_agents, ph_level,
  usda_organic, gots_certified, oeko_tex_certified, gyno_approved,
  image_url, score, source_url, verified
)
VALUES
  ('6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '73010713079', 'Tampax Radiant Regular Absorbency Tampons', 'Tampax', 'tampon', '28 count', 'Regular', 'Rayon, Cotton, Polypropylene, Polyethylene, Polyester, Glycerin, Paraffin, Ethoxylated Fatty Acid Esters, PEG-100 Stearate Ethoxylees', 'Rayon and cotton blend with synthetic fibers', 'chlorine', 'yes - polypropylene, polyethylene, polyester,paraffin, ethoxylated fatty acid esters, PEG-100', 'none listed', 'unscented', 'no', 'N/A', false, false, true, true, 'https://images.ctfassets.net/xzpusfk4t9vc/3KsSoxZfwGYxOchH04d0YD/c00eedda3b1aa4ecfdd3c3bda6d4cd14/00073010713079_C1N1_114260337.png?w=1920&fm=avif&q=80', NULL, 'https://tampax.com/en-us/all-products/radiant/regular-tampons/', true),
  ('5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '73010712867', 'Tampax Compact Pearl Regular Absorbency Tampons', 'Tampax', 'tampon', '16 count', 'Regular', 'Rayon, Cotton, Polypropylene, Polyethylene, Polyester/Poliester, Glycerin, Paraffin, Ethoxylated Fatty Acid Esters, PEG-100 Stearate, Titanium Dioxide', 'Rayon and cotton blend with synthetic fibers', 'chlorine', 'yes - polypropylene, polyethylene, polyester,paraffin, ethoxylated fatty acid esters, PEG-100', 'none listed', 'unscented', 'no', 'N/A', false, false, true, true, 'https://images.ctfassets.net/xzpusfk4t9vc/mAOvP527d5P3Ty0Q2jjju/4d0c2fcf4420b2382da26389730ff9d8/00073010712867_C1N1_113329017.png?w=1920&fm=avif&q=80', NULL, 'https://tampax.com/en-us/all-products/compact-pearl/regular-tampons/', true),
  ('a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '73010713192', 'Tampax Compact Radiant Super Absorbency Tampons', 'Tampax', 'tampon', '28 count', 'Super', 'Rayon, Cotton, Polypropylene, Polyethylene, Polyester, Glycerin, Paraffin, PEG-100 stearate, Ethoxylated Fatty Acid Esters', 'Rayon and cotton blend with synthetic fibers', 'chlorine', 'yes - polypropylene, polyethylene, polyester,paraffin, ethoxylated fatty acid esters, PEG-100', 'none listed', 'unscented', 'no', 'N/A', false, false, true, true, 'https://images.ctfassets.net/xzpusfk4t9vc/7a8iETCsb90QfKE6AwaJFh/0206eb34c7603fda29f4fef606ddb57b/00073010713192_C1N1_114781784.png?w=1920&fm=avif&q=80', NULL, 'https://tampax.com/en-us/all-products/compact-radiant/super-tampons/', true),
  ('c7428035-7291-5718-b600-2715e4d0383f'::uuid, '73010214095', 'Tampax Cardboard Regular Absorbency Tampons', 'Tampax', 'tampon', '10 count', 'Regular', 'Cotton, Rayon, Polyester, Polypropylene, Polyethylene, Fiber Finishes', 'Rayon and cotton blend with synthetic fibers', 'chlorine', 'yes - polyester, polypropylene and polyethylene', 'none listed', 'unscented', 'no', 'N/A', false, false, false, true, 'https://images.ctfassets.net/xzpusfk4t9vc/62KgWMd9CgoR7PeRqIUkv5/fd9bfb16ad2e31c3796fcc0f6399ea91/00073010214095_C1N1.png?w=1920&fm=avif&q=80', NULL, 'https://tampax.com/en-us/all-products/cardboard/regular-tampons/', true),
  ('a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '37000117162', 'Always Infinity Size 1 Regular Pads with Wings, Unscented', 'Always', 'pad', '36 count', 'Regular', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive, Polyethylene, Calcium Chloride, Titanium Dioxide, Petrolatum, Behenyl Alcohol, Zinc Oxide, Ditallowethyl Hydroxyethylmonium Methosulfate', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive', 'unknown', 'yes - polyacrylate foam, polypropylene, hot melt adhesive, polyethylene, petrolatum, ditallowethyl hydroxyethylmonium methosulfate', 'none listed', 'unscented', 'no', 'N/A', false, false, false, true, 'https://images.ctfassets.net/o5hnyn1x0ewo/116LtSW9L8UyapXlCP9oDJ/f3978ed4541bfae9e8c92cd45a85ccf3/00037000117162_C1N1.jpg?fm=webp', NULL, 'https://www.always.com/en-us/shop-products/menstrual-pads/infinity-pads-with-flexfoam/always-infinity-size-1-regular-pads-with-wings', true),
  ('39f38926-08a2-545b-9c87-3112aceec743'::uuid, '37000272687', 'Always Infinity Size 2 Heavy Flow Pads with Non-Wings, Unscented', 'Always', 'pad', '32 count', 'Heavy', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive, Polyethylene, Calcium Chloride, Titanium Dioxide, Petrolatum, Behenyl Alcohol, Zinc Oxide, Ditallowethyl Hydroxyethylmonium Methosulfate', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive', 'unknown', 'yes - polyacrylate foam, polypropylene, hot melt adhesive, polyethylene, petrolatum, ditallowethyl hydroxyethylmonium methosulfate', 'none listed', 'unscented', 'no', 'N/A', false, false, false, true, 'https://images.ctfassets.net/o5hnyn1x0ewo/2aocKY8dNMO3AtVJKtAoMg/998bb2233f1be02b70a399e6b8c25710/Infinity-FlexFoam-Pads-for-Women-without-Wings-Size-2-ct-32?fm=webp', NULL, 'https://www.always.com/en-us/shop-products/menstrual-pads/infinity-pads-with-flexfoam/always-infinity-size-2-heavy-pads-without-wings', true),
  ('254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '37000890355', 'Always Infinity Size 2 Heavy Flow Pads with Wings, Unscented', 'Always', 'pad', '46 count', 'Heavy', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive, Polyethylene, Calcium Chloride, Titanium Dioxide, Petrolatum, Behenyl Alcohol, Zinc Oxide, Ditallowethyl Hydroxyethylmonium Methosulfate', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive', 'unknown', 'yes - polyacrylate foam, polypropylene, hot melt adhesive, polyethylene, petrolatum, ditallowethyl hydroxyethylmonium methosulfate', 'none listed', 'unscented', 'no', 'N/A', false, false, false, true, 'https://images.ctfassets.net/o5hnyn1x0ewo/2PkCqevMKOzWLgRGX8kDJH/3d26a805b62a517374d6fbe527f20aad/80754813_ALW-INF-4_46-SZ-2-HVY-F3-UN-2.jpg?fm=webp', NULL, 'https://www.always.com/en-us/shop-products/menstrual-pads/infinity-pads-with-flexfoam/always-infinity-size-2-heavy-pads-with-wings', true),
  ('8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '30772165218', 'Always Radiant Teen Pads, Overnight, Unscented', 'Always', 'pad', '18 count', 'Overnight', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive, Polyethylene, Calcium Chloride, Titanium Dioxide, Petrolatum, Behenyl Alcohol, Zinc Oxide, Pigment Red 146, Pigment Yellow 185, Pigment Blue 15, Ditallowethyl Hydroxyethylmonium Methosulfate', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive', 'unknown', 'yes - polyacrylate foam, polypropylene, hot melt adhesive, polyethylene, petrolatum, pigment red 146, pigment yellow 185, pigment blue 15, ditallowethyl hydroxyethylmonium methosulfate', 'none listed', 'unscented', 'no', 'N/A', false, false, false, true, 'https://images.ctfassets.net/o5hnyn1x0ewo/3xiPN5N9E8BafwcegndP8F/6ada91f6cdb510a72f97ac4690195a87/80825958_ALW-RDT-TN-INF-2_18-SZ4-ONT-F7-2X_PI01.png?fm=webp', NULL, 'https://www.always.com/en-us/shop-products/menstrual-pads/radiant-pads-for-teens/radiant-teen-pads-overnight', true),
  ('2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '30772117491', 'Always Radiant Teen Pads, Extra Heavy, Unscented', 'Always', 'pad', '20 count', 'Extra Heavy', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive, Polyethylene, Calcium Chloride, Titanium Dioxide, Petrolatum, Behenyl Alcohol, Zinc Oxide, Pigment Red 146, Pigment Yellow 185, Pigment Blue 15, Ditallowethyl Hydroxyethylmonium Methosulfate', 'Polyacrylate Foam, Polypropylene, Hot Melt Adhesive', 'unknown', 'yes - polyacrylate foam, polypropylene, hot melt adhesive, polyethylene, petrolatum, pigment red 146, pigment yellow 185, pigment blue 15, ditallowethyl hydroxyethylmonium methosulfate', 'none listed', 'unscented', 'no', 'N/A', false, false, false, true, 'https://images.ctfassets.net/o5hnyn1x0ewo/7eUdinmouOnvbi7yAXUKqI/f35dcab5f64a380c621fc1b195e61703/00030772117491_C1N1_1200x1200.jpg?fm=webp', NULL, 'https://www.always.com/en-us/shop-products/menstrual-pads/radiant-pads-for-teens/teen-extra-heavy-with-wings', true),
  ('60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '41608003437', 'Summer''s Eve Perimenopause Cooling Wash', 'Summer''s Eve', 'wash', '15 fl oz', 'N/A', 'Water, Sodium Laureth Sulfate, Glycerin, Sodium Chloride, Lauryl Glucoside, Cocamidopropyl Betaine, Mentha Piperita (Peppermint) Oil, Eucalyptus Globulus Leaf Oil, Lactic Acid, Sodium Benzoate, Disodium EDTA, Menthyl Lactate, Sodium Lactate, Fragrance', 'Water-based liquid wash', 'N/A', 'yes - sodium benzoate and disodium EDTA', 'sodium benzoate and disodium EDTA', 'synthetic fragrance', 'no', 'not listed', false, false, false, true, 'https://www.summerseve.com/sites/summerseve/files/styles/medium/public/2025-03/Perimenopause_1000x1000pxFOP.png?itok=Cbg-RZ-N', NULL, 'https://www.summerseve.com/feminine-hygiene-products/vaginal-wash/perimenopuase-cooling-wash', true)
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO public.ingredients (
  ingredient_id, ingredient_name, inci_name, classification, plain_english_summary,
  study_title, pubmed_link, year_published, evidence_strength,
  conflicting_evidence, notes, impact_score
)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Rayon', 'Rayon', 'Neutral', 'Synthetic cellulose fiber commonly used in absorbent products.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'Cotton', 'Cotton', 'Beneficial', 'Natural fiber generally considered gentler for skin contact.', NULL, NULL, NULL, NULL, NULL, NULL, '(+1)'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'Polypropylene', 'Polypropylene', 'Neutral', 'Common polymer used in product structure and wrappers.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'Polyethylene', 'Polyethylene', 'Neutral', 'Common plastic polymer used in liners and backsheet layers.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'Polyester', 'Polyester', 'Neutral', 'Synthetic fiber used for strength and structure.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000006'::uuid, 'Glycerin', 'Glycerin', 'Beneficial', 'Humectant that helps retain moisture.', NULL, NULL, NULL, NULL, NULL, NULL, '(+1)'),
  ('00000000-0000-0000-0000-000000000007'::uuid, 'Paraffin', 'Paraffin', 'Harmful', 'Petroleum-derived wax that may irritate sensitive users.', NULL, NULL, NULL, NULL, NULL, NULL, '(-1)'),
  ('00000000-0000-0000-0000-000000000008'::uuid, 'Ethoxylated Fatty Acid Esters', 'Ethoxylated Fatty Acid Esters', 'No Data', 'Limited direct evidence available for this specific additive blend.', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('00000000-0000-0000-0000-000000000009'::uuid, 'PEG-100 Stearate', 'PEG-100 Stearate', 'Harmful', 'Ethoxylated compound that can be an irritation concern for some users.', NULL, NULL, NULL, NULL, NULL, NULL, '(-1)'),
  ('00000000-0000-0000-0000-000000000010'::uuid, 'Titanium Dioxide', 'Titanium Dioxide', 'Neutral', 'Pigment and opacifier used in many personal care products.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000011'::uuid, 'Fiber Finishes', 'Fiber Finishes', 'No Data', 'Composite manufacturing aids with variable composition.', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('00000000-0000-0000-0000-000000000012'::uuid, 'Polyacrylate Foam', 'Polyacrylate Foam', 'Harmful', 'Superabsorbent polymer matrix used for fluid lock-in.', NULL, NULL, NULL, NULL, NULL, NULL, '(-1)'),
  ('00000000-0000-0000-0000-000000000013'::uuid, 'Hot Melt Adhesive', 'Hot Melt Adhesive', 'Neutral', 'Adhesive layer used to bind absorbent product components.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000014'::uuid, 'Calcium Chloride', 'Calcium Chloride', 'Neutral', 'Salt used in trace amounts for performance tuning.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000015'::uuid, 'Petrolatum', 'Petrolatum', 'Harmful', 'Occlusive petroleum derivative that may trap moisture/irritants.', NULL, NULL, NULL, NULL, NULL, NULL, '(-1)'),
  ('00000000-0000-0000-0000-000000000016'::uuid, 'Behenyl Alcohol', 'Behenyl Alcohol', 'Neutral', 'Fatty alcohol used as a texture and stability aid.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000017'::uuid, 'Zinc Oxide', 'Zinc Oxide', 'Beneficial', 'Skin-protective mineral with soothing barrier properties.', NULL, NULL, NULL, NULL, NULL, NULL, '(+1)'),
  ('00000000-0000-0000-0000-000000000018'::uuid, 'Ditallowethyl Hydroxyethylmonium Methosulfate', 'Ditallowethyl Hydroxyethylmonium Methosulfate', 'Harmful', 'Quaternary compound that may cause irritation in sensitive users.', NULL, NULL, NULL, NULL, NULL, NULL, '(-1)'),
  ('00000000-0000-0000-0000-000000000019'::uuid, 'Pigment Red 146', 'Pigment Red 146', 'No Data', 'Colorant with limited vaginal-exposure data.', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('00000000-0000-0000-0000-000000000020'::uuid, 'Pigment Yellow 185', 'Pigment Yellow 185', 'No Data', 'Colorant with limited direct evidence for intimate-use products.', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('00000000-0000-0000-0000-000000000021'::uuid, 'Pigment Blue 15', 'Pigment Blue 15', 'No Data', 'Color additive with limited exposure-specific evidence.', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('00000000-0000-0000-0000-000000000022'::uuid, 'Water', 'Water', 'Neutral', 'Primary solvent in water-based washes and wipes.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000023'::uuid, 'Sodium Laureth Sulfate', 'Sodium Laureth Sulfate', 'Harmful', 'Surfactant associated with irritation in some sensitive users.', NULL, NULL, NULL, NULL, NULL, NULL, '(-1)'),
  ('00000000-0000-0000-0000-000000000024'::uuid, 'Sodium Chloride', 'Sodium Chloride', 'Neutral', 'Salt used for viscosity and formulation balance.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000025'::uuid, 'Lauryl Glucoside', 'Lauryl Glucoside', 'Beneficial', 'Mild nonionic surfactant generally considered gentler than sulfates.', NULL, NULL, NULL, NULL, NULL, NULL, '(+1)'),
  ('00000000-0000-0000-0000-000000000026'::uuid, 'Cocamidopropyl Betaine', 'Cocamidopropyl Betaine', 'Neutral', 'Common amphoteric surfactant that can be tolerated by many users.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000027'::uuid, 'Lactic Acid', 'Lactic Acid', 'Beneficial', 'Can support acidic pH balance in intimate wash formulations.', NULL, NULL, NULL, NULL, NULL, NULL, '(+2)'),
  ('00000000-0000-0000-0000-000000000028'::uuid, 'Sodium Benzoate', 'Sodium Benzoate', 'Neutral', 'Widely used preservative with generally acceptable safety profile.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000029'::uuid, 'Disodium EDTA', 'Disodium EDTA', 'Neutral', 'Chelating agent used to stabilize formulations.', NULL, NULL, NULL, NULL, NULL, NULL, '(0)'),
  ('00000000-0000-0000-0000-000000000030'::uuid, 'Fragrance', 'Fragrance', 'Harmful', 'Fragrance mixes are frequent triggers for sensitivity and irritation.', NULL, NULL, NULL, NULL, NULL, NULL, '(-2)'),
  
  -- Extra test ingredients for product 6a31292e-3e09-5f39-a80e-b1c139dabc6f

  ('00000000-0000-0000-0000-000000000031'::uuid, 'Aloe Vera Extract', 'Aloe Barbadensis Leaf Extract', 'Beneficial', 'Soothing botanical often used to calm irritation.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(+2)'),
  ('00000000-0000-0000-0000-000000000032'::uuid, 'Tea Tree Oil', 'Melaleuca Alternifolia Leaf Oil', 'Harmful', 'Can be sensitizing for some users in intimate products.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(-2)'),
  ('00000000-0000-0000-0000-000000000033'::uuid, 'Panthenol', 'Panthenol', 'Beneficial', 'Pro-vitamin B5 with moisturizing support.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(+1)'),
  ('00000000-0000-0000-0000-000000000034'::uuid, 'Phenoxyethanol', 'Phenoxyethanol', 'Harmful', 'Preservative with irritation concerns in sensitive users.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(-1)'),
  ('00000000-0000-0000-0000-000000000035'::uuid, 'Sodium Citrate', 'Sodium Citrate', 'Neutral', 'Buffering agent commonly used for pH adjustment.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(0)'),
  ('00000000-0000-0000-0000-000000000036'::uuid, 'Chamomile Extract', 'Chamomilla Recutita Flower Extract', 'Beneficial', 'Botanical extract associated with soothing effects.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(+2)'),
  ('00000000-0000-0000-0000-000000000037'::uuid, 'Methylparaben', 'Methylparaben', 'Harmful', 'Preservative often flagged for endocrine-safety concerns.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(-2)'),
  ('00000000-0000-0000-0000-000000000038'::uuid, 'Caprylyl Glycol', 'Caprylyl Glycol', 'Neutral', 'Humectant/preservative booster generally tolerated.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(0)'),
  ('00000000-0000-0000-0000-000000000039'::uuid, 'Limonene', 'Limonene', 'Harmful', 'Fragrance allergen marker in sensitive populations.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(-1)'),
  ('00000000-0000-0000-0000-000000000040'::uuid, 'Niacinamide', 'Niacinamide', 'Beneficial', 'Barrier-supportive vitamin B3 derivative.', NULL, NULL, NULL, NULL, NULL, 'test seed', '(+1)')
ON CONFLICT (ingredient_id) DO NOTHING;

INSERT INTO public.product_ingredients (id, product_id, ingredient_id)
VALUES
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000031'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000032'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000033'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000034'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000035'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000036'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000037'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000038'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000039'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000040'::uuid),

  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000002'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000007'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000008'::uuid),
  (gen_random_uuid(), '6a31292e-3e09-5f39-a80e-b1c139dabc6f'::uuid, '00000000-0000-0000-0000-000000000009'::uuid),

  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000002'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000007'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000009'::uuid),
  (gen_random_uuid(), '5f72140f-6c76-5857-9b72-bd363604fc28'::uuid, '00000000-0000-0000-0000-000000000010'::uuid),

  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000002'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000007'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000008'::uuid),
  (gen_random_uuid(), 'a52c1dfb-399b-5ab6-893f-07f362a97a53'::uuid, '00000000-0000-0000-0000-000000000009'::uuid),

  (gen_random_uuid(), 'c7428035-7291-5718-b600-2715e4d0383f'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
  (gen_random_uuid(), 'c7428035-7291-5718-b600-2715e4d0383f'::uuid, '00000000-0000-0000-0000-000000000002'::uuid),
  (gen_random_uuid(), 'c7428035-7291-5718-b600-2715e4d0383f'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), 'c7428035-7291-5718-b600-2715e4d0383f'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), 'c7428035-7291-5718-b600-2715e4d0383f'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
  (gen_random_uuid(), 'c7428035-7291-5718-b600-2715e4d0383f'::uuid, '00000000-0000-0000-0000-000000000011'::uuid),

  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000012'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000013'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000014'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000010'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000015'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000016'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000017'::uuid),
  (gen_random_uuid(), 'a7ffdb94-4650-5ebd-adf5-a64ff7aecbf2'::uuid, '00000000-0000-0000-0000-000000000018'::uuid),

  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000012'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000013'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000014'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000010'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000015'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000016'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000017'::uuid),
  (gen_random_uuid(), '39f38926-08a2-545b-9c87-3112aceec743'::uuid, '00000000-0000-0000-0000-000000000018'::uuid),

  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000012'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000013'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000014'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000010'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000015'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000016'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000017'::uuid),
  (gen_random_uuid(), '254c9382-dfdd-5cf3-b545-c53c1e116371'::uuid, '00000000-0000-0000-0000-000000000018'::uuid),

  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000012'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000013'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000014'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000010'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000015'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000016'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000017'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000018'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000019'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000020'::uuid),
  (gen_random_uuid(), '8042fd79-0f0b-56e3-b1c4-c525d976ff44'::uuid, '00000000-0000-0000-0000-000000000021'::uuid),

  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000012'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000013'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000014'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000010'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000015'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000016'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000017'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000018'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000019'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000020'::uuid),
  (gen_random_uuid(), '2e400c11-6137-5c56-9097-3853ca95e1d2'::uuid, '00000000-0000-0000-0000-000000000021'::uuid),

  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000022'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000023'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000024'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000025'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000026'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000027'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000028'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000029'::uuid),
  (gen_random_uuid(), '60e01d09-10a3-58ad-9bff-378f7268f32e'::uuid, '00000000-0000-0000-0000-000000000030'::uuid)
ON CONFLICT (product_id, ingredient_id) DO NOTHING;

INSERT INTO public.scoring_rules (id, min_score, max_score, rating, color)
VALUES
  (gen_random_uuid(), 70, 100, 'Microbiome Friendly', 'green'),
  (gen_random_uuid(), 40, 69, 'Use With Caution', 'yellow'),
  (gen_random_uuid(), 0, 39, 'Not Recommended', 'red')
ON CONFLICT DO NOTHING;

COMMIT;
