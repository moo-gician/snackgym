export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Core' | 'Legs';
  splitType: 'Push' | 'Pull' | 'Legs' | 'Core'; 
  equipment: string; 
  baseReps: number | string; 
  baseWeight: string; 
  isStretch: boolean;
}

export const EXERCISE_DB: Exercise[] = [
  // ================= PUSH (Chest, Shoulders, Triceps) =================
  // Chest
  { id: 'ch_mat_pushup', name: 'Floor Push-Up', muscleGroup: 'Chest', splitType: 'Push', equipment: 'Mat', baseReps: 15, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'ch_bw_desk_pushup', name: 'Desk Push-Up', muscleGroup: 'Chest', splitType: 'Push', equipment: 'Bodyweight', baseReps: 20, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'ch_bw_wall_pushup', name: 'Wall Push-Up', muscleGroup: 'Chest', splitType: 'Push', equipment: 'Bodyweight', baseReps: 25, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'ch_db_press', name: 'Dumbbell Chest Press', muscleGroup: 'Chest', splitType: 'Push', equipment: 'Dumbbell', baseReps: 12, baseWeight: '10kg', isStretch: false },
  { id: 'ch_bb_bench', name: 'Barbell Bench Press', muscleGroup: 'Chest', splitType: 'Push', equipment: 'Barbell', baseReps: 10, baseWeight: '40kg', isStretch: false },
  { id: 'ch_bench_incline', name: 'Incline Bench Press', muscleGroup: 'Chest', splitType: 'Push', equipment: 'Bench', baseReps: 12, baseWeight: '30kg', isStretch: false },
  { id: 'ch_cable_cross', name: 'Cable Crossover', muscleGroup: 'Chest', splitType: 'Push', equipment: 'CableMachine', baseReps: 15, baseWeight: '10kg', isStretch: false },
  { id: 'ch_pb_dips', name: 'Chest Dips', muscleGroup: 'Chest', splitType: 'Push', equipment: 'ParallelBars', baseReps: 10, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'ch_smith_press', name: 'Smith Machine Press', muscleGroup: 'Chest', splitType: 'Push', equipment: 'SmithMachine', baseReps: 12, baseWeight: '30kg', isStretch: false },
  { id: 'ch_str_wall_open', name: 'Wall Chest Opener', muscleGroup: 'Chest', splitType: 'Push', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },

  // Shoulders
  { id: 'sh_db_press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', splitType: 'Push', equipment: 'Dumbbell', baseReps: 12, baseWeight: '8kg', isStretch: false },
  { id: 'sh_bb_ohp', name: 'Overhead Press', muscleGroup: 'Shoulders', splitType: 'Push', equipment: 'Barbell', baseReps: 10, baseWeight: '20kg', isStretch: false },
  { id: 'sh_cable_lateral', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', splitType: 'Push', equipment: 'CableMachine', baseReps: 15, baseWeight: '5kg', isStretch: false },
  { id: 'sh_pb_walks', name: 'Shoulder PB Walks', muscleGroup: 'Shoulders', splitType: 'Push', equipment: 'ParallelBars', baseReps: '30 sec', baseWeight: 'Bodyweight', isStretch: false },
  { id: 'sh_str_neck_roll', name: 'Seated Neck & Shoulder Roll', muscleGroup: 'Shoulders', splitType: 'Push', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },

  // Triceps
  { id: 'tr_bw_bench_dips', name: 'Chair/Bench Dips', muscleGroup: 'Arms', splitType: 'Push', equipment: 'Bodyweight', baseReps: 15, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'tr_db_ext', name: 'Dumbbell Overhead Ext', muscleGroup: 'Arms', splitType: 'Push', equipment: 'Dumbbell', baseReps: 12, baseWeight: '6kg', isStretch: false },
  { id: 'tr_cable_pushdown', name: 'Cable Pushdown', muscleGroup: 'Arms', splitType: 'Push', equipment: 'CableMachine', baseReps: 15, baseWeight: '15kg', isStretch: false },
  { id: 'tr_pb_russian_dips', name: 'Russian Dips', muscleGroup: 'Arms', splitType: 'Push', equipment: 'ParallelBars', baseReps: 8, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'tr_ez_skull', name: 'EZ Bar Skull Crusher', muscleGroup: 'Arms', splitType: 'Push', equipment: 'EZBar', baseReps: 12, baseWeight: '15kg', isStretch: false },
  { id: 'tr_band_ext', name: 'Band Overhead Ext', muscleGroup: 'Arms', splitType: 'Push', equipment: 'Band', baseReps: 15, baseWeight: 'Band', isStretch: false },
  { id: 'tr_str_overhead', name: 'Standing Triceps Stretch', muscleGroup: 'Arms', splitType: 'Push', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },

  // ================= PULL (Back, Biceps) =================
  // Back
  { id: 'ba_mat_superman', name: 'Floor Superman Extension', muscleGroup: 'Back', splitType: 'Pull', equipment: 'Mat', baseReps: 15, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'ba_bw_towel_row', name: 'Isometric Towel Row', muscleGroup: 'Back', splitType: 'Pull', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Isometric', isStretch: false },
  { id: 'ba_pullup', name: 'Pull-Up', muscleGroup: 'Back', splitType: 'Pull', equipment: 'PullupBar', baseReps: 8, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'ba_db_row', name: 'One-Arm Dumbbell Row', muscleGroup: 'Back', splitType: 'Pull', equipment: 'Dumbbell', baseReps: 12, baseWeight: '12kg', isStretch: false },
  { id: 'ba_bb_row', name: 'Barbell Row', muscleGroup: 'Back', splitType: 'Pull', equipment: 'Barbell', baseReps: 10, baseWeight: '30kg', isStretch: false },
  { id: 'ba_cable_lat', name: 'Lat Pulldown', muscleGroup: 'Back', splitType: 'Pull', equipment: 'CableMachine', baseReps: 12, baseWeight: '25kg', isStretch: false },
  { id: 'ba_pb_inv_row', name: 'Inverted Row', muscleGroup: 'Back', splitType: 'Pull', equipment: 'ParallelBars', baseReps: 12, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'ba_str_cat_cow', name: 'Seated Cat-Cow', muscleGroup: 'Back', splitType: 'Pull', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },
  { id: 'ba_str_ywt', name: 'Standing Y-W-T Holds', muscleGroup: 'Back', splitType: 'Pull', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },

  // Biceps
  { id: 'bi_db_curl', name: 'Dumbbell Bicep Curl', muscleGroup: 'Arms', splitType: 'Pull', equipment: 'Dumbbell', baseReps: 12, baseWeight: '8kg', isStretch: false },
  { id: 'bi_bb_curl', name: 'Barbell Curl', muscleGroup: 'Arms', splitType: 'Pull', equipment: 'Barbell', baseReps: 10, baseWeight: '15kg', isStretch: false },
  { id: 'bi_cable_curl', name: 'Cable Bicep Curl', muscleGroup: 'Arms', splitType: 'Pull', equipment: 'CableMachine', baseReps: 15, baseWeight: '10kg', isStretch: false },
  { id: 'bi_ez_curl', name: 'EZ Bar Curl', muscleGroup: 'Arms', splitType: 'Pull', equipment: 'EZBar', baseReps: 12, baseWeight: '15kg', isStretch: false },
  { id: 'bi_str_wrist', name: 'Desk Wrist Extensor Stretch', muscleGroup: 'Arms', splitType: 'Pull', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },

  // ================= LEGS =================
  // Legs
  { id: 'le_bw_squat', name: 'Air Squat', muscleGroup: 'Legs', splitType: 'Legs', equipment: 'Bodyweight', baseReps: 20, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'le_db_lunge', name: 'Dumbbell Lunge', muscleGroup: 'Legs', splitType: 'Legs', equipment: 'Dumbbell', baseReps: 12, baseWeight: '10kg', isStretch: false },
  { id: 'le_bb_squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', splitType: 'Legs', equipment: 'Barbell', baseReps: 10, baseWeight: '40kg', isStretch: false },
  { id: 'le_str_quad', name: 'Standing Quad Stretch', muscleGroup: 'Legs', splitType: 'Legs', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },
  { id: 'le_str_pigeon', name: 'Seated Pigeon Pose', muscleGroup: 'Legs', splitType: 'Legs', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },

  // ================= CORE =================
  // Core (Floor/Mat)
  { id: 'co_mat_crunch', name: 'Floor Crunch', muscleGroup: 'Core', splitType: 'Core', equipment: 'Mat', baseReps: 20, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'co_mat_legraise', name: 'Floor Leg Raise', muscleGroup: 'Core', splitType: 'Core', equipment: 'Mat', baseReps: 15, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'co_mat_plank', name: 'Floor Plank', muscleGroup: 'Core', splitType: 'Core', equipment: 'Mat', baseReps: '45 sec', baseWeight: 'Bodyweight', isStretch: false },
  
  // Core (Standing/Desk - No Mat needed)
  { id: 'co_bw_desk_plank', name: 'Desk Edge Plank', muscleGroup: 'Core', splitType: 'Core', equipment: 'Bodyweight', baseReps: '45 sec', baseWeight: 'Bodyweight', isStretch: false },
  { id: 'co_bw_stand_bicycle', name: 'Standing Bicycle Crunch', muscleGroup: 'Core', splitType: 'Core', equipment: 'Bodyweight', baseReps: 20, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'co_pb_wiper', name: 'Hanging Windshield Wiper', muscleGroup: 'Core', splitType: 'Core', equipment: 'PullupBar', baseReps: 10, baseWeight: 'Bodyweight', isStretch: false },
  { id: 'co_str_twist', name: 'Seated Spinal Twist', muscleGroup: 'Core', splitType: 'Core', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },
  { id: 'co_str_forward', name: 'Seated Forward Bend', muscleGroup: 'Core', splitType: 'Core', equipment: 'Bodyweight', baseReps: '30 sec', baseWeight: 'Stretch', isStretch: true },
];
