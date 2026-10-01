(() => {
  'use strict';

  /* ---------- Supabase ---------- */
  const SUPABASE_URL = 'https://ruwndgtsequulazlbfhd.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d25kZ3RzZXF1dWxhemxiZmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NDQzODgsImV4cCI6MjEwNjQyMDM4OH0.Zr40UqML2IWekO7W7Fp0QTF5Zr8y3KMW08MEytKfNPA';
  const sb = window.supabase?.createClient ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c]));
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
    remove(key) { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } }
  };

  let toastTimer;
  const toast = message => {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  };

  /* ---------- Seed data ---------- */
  const SEED_DISHES = [
    { id: 'dal', name: 'Everyday dal', hue: 1, servings: '4 people', spice: 'Gentle', ingredients: ['1 cup toor dal', '1 tomato, chopped', '1 small onion', '1/2 tsp turmeric', 'a small handful of coriander'], method: 'Pressure cook dal with turmeric. Temper with cumin, garlic and a little ghee.', notes: "Make a little extra for tomorrow's lunch.", tags: ['quick', 'loved'], description: 'The comforting yellow dal that makes rice feel like a proper meal.' },
    { id: 'rice', name: 'Jeera rice', hue: 5, servings: '4 people', spice: 'Gentle', ingredients: ['2 cups basmati rice', '1 tbsp cumin seeds', '1 bay leaf', '2 tbsp ghee'], method: 'Wash and rest rice. Warm ghee, crackle cumin, then cook rice until fluffy.', notes: 'Good with dal or rajma.', tags: ['quick'], description: 'Fluffy rice with a little fragrance and plenty of possibilities.' },
    { id: 'aloo', name: 'Aloo gobi', hue: 2, servings: '3 people', spice: 'Medium', ingredients: ['3 potatoes', '1 small cauliflower', '1 tomato', '1 tsp coriander powder', 'a handful of fresh coriander'], method: 'Cook the spices first, then add potato and cauliflower. Cover until tender.', notes: 'Keep the cauliflower pieces big.', tags: ['loved'], description: 'Dry, golden and best eaten with roti while still warm.' },
    { id: 'roti', name: 'Soft roti', hue: 0, servings: '4 people', spice: 'As we like it', ingredients: ['2 cups atta', 'water, as needed', 'a pinch of salt'], method: 'Knead a soft dough, rest it, roll thin and cook on a hot tawa.', notes: 'Keep dough soft. Make a few extra for breakfast.', tags: ['quick'], description: 'The everyday bread that turns almost anything into dinner.' },
    { id: 'dosa', name: 'Crisp dosa', hue: 3, servings: '4 people', spice: 'Gentle', ingredients: ['2 cups dosa batter', 'oil or ghee', 'potato masala, optional'], method: 'Stir batter gently. Spread on a hot tawa and cook until the edges crisp.', notes: 'Batter is best after a night in the fridge.', tags: ['loved'], description: 'A weekend breakfast with crisp edges and soft middles.' },
    { id: 'khichdi', name: 'Moong dal khichdi', hue: 4, servings: '3 people', spice: 'Gentle', ingredients: ['1 cup rice', '1/2 cup moong dal', '1 carrot, chopped', '1/2 tsp turmeric', '1 tbsp ghee'], method: 'Rinse everything. Pressure cook with extra water until soft and spoonable.', notes: 'Good for a quiet night. Add ghee at the table.', tags: [], description: 'Soft, warm and kind to the whole household.' },
    { id: 'paneer-butter', name: 'Paneer butter masala', hue: 0, servings: '4 people', spice: 'Medium', ingredients: ['250 g paneer, cubed', '3 tomatoes', '1 onion', '10 cashews', '2 tbsp butter', '1/4 cup cream', '1 tsp garam masala powder', '1 tsp kashmiri chilli powder'], method: 'Blend cooked tomato, onion and cashew into a smooth gravy. Simmer with butter and spices, add paneer and finish with cream.', notes: 'Save for Sundays and guests.', tags: ['loved'], description: 'Rich, silky and the first thing to disappear at a dinner party.' },
    { id: 'palak-paneer', name: 'Palak paneer', hue: 2, servings: '4 people', spice: 'Medium', ingredients: ['2 bunches spinach', '200 g paneer, cubed', '1 onion', '1 tomato', '1 tbsp ginger garlic paste', '1 tsp cumin seeds', '1 tbsp ghee'], method: 'Blanch spinach and blend. Sauté onion, tomato and ginger garlic, add the purée and simmer. Stir in paneer.', notes: 'Blanch quickly so it stays bright green.', tags: [], description: 'A deep green gravy with soft cubes of paneer.' },
    { id: 'chole', name: 'Chole', hue: 5, servings: '4 people', spice: 'Hot', ingredients: ['2 cups chickpeas, soaked overnight', '2 onions', '2 tomatoes', '1 tbsp chole masala', '1 tsp amchur powder', '1 tea bag'], method: 'Pressure cook chickpeas with a tea bag for colour. Cook onion-tomato masala with spices, add chickpeas and simmer until thick.', notes: 'Soak the chickpeas the night before.', tags: ['loved'], description: 'Dark, tangy chickpeas that beg for bhature or rice.' },
    { id: 'rajma', name: 'Rajma chawal', hue: 0, servings: '4 people', spice: 'Medium', ingredients: ['1 cup rajma, soaked overnight', '2 onions', '2 tomatoes', '1 tbsp ginger garlic paste', '1 tsp garam masala powder', '2 cups basmati rice'], method: 'Pressure cook rajma until very soft. Simmer in a slow-cooked onion-tomato masala and mash a few beans to thicken. Serve over rice.', notes: 'Tastes even better the next day.', tags: ['loved'], description: 'The Sunday lunch that everyone asks for.' },
    { id: 'aloo-paratha', name: 'Aloo paratha', hue: 1, servings: '4 people', spice: 'Medium', ingredients: ['2 cups atta', '4 potatoes, boiled', '1 green chilli, chopped', 'a handful of coriander', '1 tsp ajwain seeds', 'butter, to serve'], method: 'Mash potato with chilli, coriander and spices. Stuff into dough balls, roll gently and cook on a hot tawa with ghee.', notes: 'Serve with curd and pickle.', tags: ['loved'], description: 'Golden stuffed flatbread for slow weekend breakfasts.' },
    { id: 'poha', name: 'Kanda poha', hue: 1, servings: '3 people', spice: 'Gentle', ingredients: ['2 cups thick poha', '1 onion', '1 potato, diced', '1 tsp mustard seeds', '1/2 tsp turmeric', '2 tbsp peanuts', '1 lemon'], method: 'Rinse poha and let it soften. Temper mustard, peanuts and onion, add potato and turmeric, then fold in poha. Finish with lemon.', notes: 'Ready in fifteen minutes.', tags: ['quick'], description: 'A light yellow breakfast with crunchy peanuts and a squeeze of lemon.' },
    { id: 'upma', name: 'Rava upma', hue: 5, servings: '3 people', spice: 'Gentle', ingredients: ['1 cup rava', '1 onion', '1 tsp mustard seeds', '1 tsp urad dal', '1 green chilli', '8 curry leaves', '2 tbsp ghee'], method: 'Roast rava until fragrant. Temper mustard, dal, curry leaves and onion, add hot water, then stir in rava until fluffy.', notes: 'Keep stirring so there are no lumps.', tags: ['quick'], description: 'Warm, savoury semolina for busy mornings.' },
    { id: 'idli', name: 'Idli sambar', hue: 4, servings: '4 people', spice: 'Medium', ingredients: ['3 cups idli batter', '1/2 cup toor dal', '1 drumstick', '1 carrot', '1 tbsp sambar powder', '1 small lemon-sized tamarind'], method: 'Steam idlis for ten minutes. Cook dal and vegetables with tamarind and sambar powder, then temper with mustard and curry leaves.', notes: 'Coconut chutney on the side.', tags: [], description: 'Pillowy steamed idlis with a bowl of tangy sambar.' },
    { id: 'biryani', name: 'Veg biryani', hue: 3, servings: '5 people', spice: 'Hot', ingredients: ['2 cups basmati rice', '3 cups mixed vegetables', '1 cup curd', '2 onions, fried', '2 tbsp biryani masala', 'a pinch of saffron', 'a handful of mint'], method: 'Marinate vegetables in curd and masala. Layer with par-boiled rice, fried onions, mint and saffron milk. Seal and cook on dum.', notes: 'Serve with raita.', tags: ['loved'], description: 'Fragrant layers of rice, spice and vegetables for special days.' },
    { id: 'pav-bhaji', name: 'Pav bhaji', hue: 0, servings: '4 people', spice: 'Hot', ingredients: ['4 potatoes, boiled', '1 cup peas', '1 capsicum', '2 tomatoes', '2 onions', '2 tbsp pav bhaji masala', '3 tbsp butter', '8 pav'], method: 'Mash cooked vegetables in butter with onion, tomato and masala until smooth. Toast pav in butter and serve with onion and lemon.', notes: 'More butter is always the answer.', tags: ['loved'], description: 'Buttery Mumbai street food made at home.' },
    { id: 'bhindi', name: 'Bhindi masala', hue: 2, servings: '3 people', spice: 'Medium', ingredients: ['250 g bhindi', '1 onion', '1 tomato', '1 tsp coriander powder', '1 tsp amchur powder', '2 tbsp oil'], method: 'Dry the bhindi fully before cutting. Stir-fry until no longer sticky, then add onion, tomato and spices.', notes: 'Wipe bhindi dry — no slime.', tags: ['quick'], description: 'Crisp-edged okra with a dry, tangy masala.' },
    { id: 'curd-rice', name: 'Curd rice', hue: 4, servings: '2 people', spice: 'Gentle', ingredients: ['1 cup cooked rice', '1 cup curd', '1 tsp mustard seeds', '8 curry leaves', '1 green chilli', 'a small piece of ginger'], method: 'Mash rice with curd and salt. Pour over a tempering of mustard, curry leaves, chilli and ginger.', notes: 'Best on hot afternoons.', tags: ['quick'], description: 'Cool, comforting and the perfect end to a spicy meal.' },
    { id: 'dhokla', name: 'Khaman dhokla', hue: 1, servings: '4 people', spice: 'Gentle', ingredients: ['1 1/2 cups besan', '1 tsp eno', '1 tbsp sugar', '1 lemon', '1 tsp mustard seeds', '2 green chillies', 'a handful of coriander'], method: 'Whisk besan with sugar, lemon and water. Add eno and steam for fifteen minutes. Pour over a mustard and chilli tempering.', notes: 'Do not open the steamer early.', tags: [], description: 'Spongy steamed squares with a sweet-sour tempering.' },
    { id: 'kheer', name: 'Rice kheer', hue: 3, servings: '4 people', spice: 'Gentle', ingredients: ['1 litre milk', '1/4 cup rice', '1/2 cup sugar', '4 cardamom pods', '10 almonds', '10 cashews'], method: 'Simmer rice in milk, stirring often, until thick and creamy. Add sugar, cardamom and nuts.', notes: 'For festivals and birthdays.', tags: ['loved', 'dessert'], description: 'Slow-cooked, creamy rice pudding with cardamom.' },
    { id: 'chai', name: 'Masala chai', hue: 5, servings: '2 people', spice: 'Medium', ingredients: ['1 cup milk', '1 cup water', '2 tsp tea leaves', '2 cardamom pods', 'a small piece of ginger', '2 tsp sugar'], method: 'Boil water with crushed ginger and cardamom. Add tea, then milk and sugar, and let it rise twice.', notes: 'Every evening at five.', tags: ['quick', 'loved', 'drink'], description: 'Strong, spiced tea that starts every conversation.' },
    { id: 'mango-lassi', since: 3, name: 'Mango lassi', hue: 1, servings: '2 people', spice: 'Gentle', ingredients: ['1 cup mango pulp', '1 cup curd', '1/2 cup milk', '2 tbsp sugar', 'a pinch of cardamom powder'], method: 'Blend mango, curd, milk and sugar until frothy. Pour over ice and dust with cardamom.', notes: 'Use Alphonso when in season.', tags: ['quick', 'loved', 'drink'], description: 'Thick, golden and the taste of summer holidays.' },
    { id: 'chaas', since: 3, name: 'Masala chaas', hue: 2, servings: '4 people', spice: 'Gentle', ingredients: ['1 cup curd', '3 cups water', '1 tsp roasted cumin powder', 'a small handful of mint', 'a pinch of black salt'], method: 'Whisk curd with water until smooth. Stir in cumin, black salt and chopped mint. Serve chilled.', notes: 'Best after a heavy lunch.', tags: ['quick', 'drink'], description: 'Cool, salty buttermilk that settles every big meal.' },
    { id: 'nimbu-pani', since: 3, name: 'Nimbu pani', hue: 2, servings: '4 people', spice: 'Gentle', ingredients: ['3 lemons', '4 cups water', '4 tbsp sugar', 'a pinch of black salt', 'a handful of mint'], method: 'Dissolve sugar and salt in water, squeeze in lemons and add bruised mint. Serve over ice.', notes: 'Add soda for a fizzy version.', tags: ['quick', 'drink'], description: 'Sweet, sour and salty lemonade for hot afternoons.' },
    { id: 'filter-coffee', since: 3, name: 'Filter coffee', hue: 5, servings: '2 people', spice: 'Gentle', ingredients: ['3 tbsp coffee powder', '1 cup water', '1 1/2 cups milk', '2 tsp sugar'], method: 'Brew a strong decoction in the filter. Mix with hot milk and sugar, then pour between tumbler and dabarah until frothy.', notes: 'Let the decoction drip slowly.', tags: ['quick', 'loved', 'drink'], description: 'Strong, frothy South Indian coffee in a steel tumbler.' },
    { id: 'badam-milk', since: 3, name: 'Badam milk', hue: 1, servings: '3 people', spice: 'Gentle', ingredients: ['3 cups milk', '20 almonds, soaked', '3 tbsp sugar', 'a pinch of saffron', '3 cardamom pods'], method: 'Peel and grind soaked almonds. Simmer in milk with sugar, saffron and cardamom until slightly thick.', notes: 'Serve warm in winter, chilled in summer.', tags: ['drink'], description: 'Creamy saffron milk thick with ground almonds.' },
    { id: 'aam-panna', since: 3, name: 'Aam panna', hue: 2, servings: '4 people', spice: 'Gentle', ingredients: ['2 raw mangoes', '4 tbsp sugar', '1 tsp roasted cumin powder', 'a pinch of black salt', 'a handful of mint'], method: 'Boil raw mangoes until soft. Scoop the pulp and blend with sugar, spices, mint and cold water.', notes: 'Make a batch of concentrate for the week.', tags: ['drink'], description: 'Tangy raw-mango cooler that beats the heat.' },
    { id: 'thandai', since: 3, name: 'Thandai', hue: 3, servings: '4 people', spice: 'Gentle', ingredients: ['4 cups milk', '15 almonds', '1 tbsp fennel seeds', '1 tbsp poppy seeds', '10 black peppercorns', '4 tbsp sugar', 'a pinch of saffron'], method: 'Soak nuts and spices, then grind to a fine paste. Stir into chilled sweetened milk and strain.', notes: 'Holi special.', tags: ['drink'], description: 'Chilled festive milk with nuts, fennel and saffron.' },
    { id: 'rose-sharbat', since: 3, name: 'Rose sharbat', hue: 0, servings: '4 people', spice: 'Gentle', ingredients: ['4 tbsp rose syrup', '4 cups chilled water', '1 lemon', '2 tbsp basil seeds'], method: 'Soak basil seeds until they swell. Stir rose syrup and lemon into cold water and add the seeds.', notes: 'Pretty in glass jugs for guests.', tags: ['quick', 'drink'], description: 'A pink, floral cooler with soft basil seeds.' },
    { id: 'gulab-jamun', since: 3, name: 'Gulab jamun', hue: 5, servings: '6 people', spice: 'Gentle', ingredients: ['1 cup khoya', '3 tbsp maida', '2 cups sugar', '2 cups water', '4 cardamom pods', 'oil or ghee, for frying'], method: 'Knead khoya and maida into smooth balls. Fry slowly until deep brown, then soak in warm cardamom syrup.', notes: 'Fry on low heat so the centres cook.', tags: ['loved', 'dessert'], description: 'Soft, syrupy dumplings that nobody stops at one of.' },
    { id: 'gajar-halwa', since: 3, name: 'Gajar ka halwa', hue: 0, servings: '5 people', spice: 'Gentle', ingredients: ['1 kg carrots, grated', '1 litre milk', '3/4 cup sugar', '4 tbsp ghee', '10 cashews', '10 almonds', '4 cardamom pods'], method: 'Cook grated carrots in milk until it evaporates. Add sugar and ghee and roast until glossy. Finish with nuts.', notes: 'Winter only, with red Delhi carrots.', tags: ['loved', 'dessert'], description: 'Slow-cooked winter carrots in milk, ghee and nuts.' },
    { id: 'rasmalai', since: 3, name: 'Rasmalai', hue: 1, servings: '6 people', spice: 'Gentle', ingredients: ['2 litres milk', '1 lemon', '1 cup sugar', 'a pinch of saffron', '10 pistachios'], method: 'Curdle half the milk with lemon to make chenna. Shape into discs and cook in sugar syrup. Soak in the rest of the milk, thickened with saffron, and chill overnight.', notes: 'Make a day ahead.', tags: ['dessert'], description: 'Soft cheese discs soaked in chilled saffron milk.' },
    { id: 'sooji-halwa', since: 3, name: 'Sooji halwa', hue: 1, servings: '4 people', spice: 'Gentle', ingredients: ['1/2 cup rava', '1/2 cup ghee', '1/2 cup sugar', '1 1/2 cups water', '10 cashews', '4 cardamom pods'], method: 'Roast rava in ghee until golden and nutty. Pour in hot sugar water carefully and stir until it leaves the pan.', notes: 'Temple-style sheera for pujas.', tags: ['quick', 'dessert'], description: 'Warm, ghee-roasted semolina ready in twenty minutes.' },
    { id: 'kulfi', since: 3, name: 'Malai kulfi', hue: 4, servings: '6 people', spice: 'Gentle', ingredients: ['1 litre milk', '1/2 cup condensed milk', '15 pistachios', 'a pinch of saffron', '4 cardamom pods'], method: 'Reduce milk to half. Stir in condensed milk, saffron, cardamom and nuts. Freeze in moulds overnight.', notes: 'Unmould under warm water.', tags: ['loved', 'dessert'], description: 'Dense, creamy Indian ice cream with pistachio.' },
    { id: 'besan-ladoo', since: 3, name: 'Besan ladoo', hue: 5, servings: '12 ladoos', spice: 'Gentle', ingredients: ['2 cups besan', '3/4 cup ghee', '1 cup powdered sugar', '4 cardamom pods', '10 almonds'], method: 'Roast besan in ghee on low heat until fragrant. Cool slightly, mix in sugar and cardamom and shape into balls.', notes: 'Keeps for two weeks in a tin.', tags: ['dessert'], description: 'Nutty, melt-in-the-mouth sweets for every festival.' },
    { id: 'shrikhand', since: 3, name: 'Shrikhand', hue: 1, servings: '4 people', spice: 'Gentle', ingredients: ['4 cups curd', '1/2 cup powdered sugar', 'a pinch of saffron', '4 cardamom pods', '10 pistachios'], method: 'Hang curd overnight to make thick chakka. Whisk with sugar, saffron and cardamom. Chill and top with nuts.', notes: 'Hang the curd the night before.', tags: ['dessert'], description: 'Thick, sweet strained yoghurt with saffron.' },
    { id: 'payasam', since: 3, name: 'Semiya payasam', hue: 4, servings: '4 people', spice: 'Gentle', ingredients: ['1 cup vermicelli', '4 cups milk', '1/2 cup sugar', '2 tbsp ghee', '10 cashews', '1 tbsp raisins', '4 cardamom pods'], method: 'Roast vermicelli, cashews and raisins in ghee. Simmer in milk until soft, then add sugar and cardamom.', notes: 'For Onam and birthdays.', tags: ['quick', 'dessert'], description: 'Vermicelli simmered in sweet cardamom milk.' }
  ];
  const SEED_VERSION = 3;

  /* Dish photos from Wikimedia Commons, saved locally in images/ so they load instantly and offline.
     Each is CC BY / CC BY-SA; authors and licences are in PHOTO_CREDITS and images/credits.json. */
  const DISH_IMAGES = {
    dal: "images/dal.jpg",
    rice: "images/rice.jpg",
    aloo: "images/aloo.jpg",
    roti: "images/roti.jpg",
    dosa: "images/dosa.jpg",
    khichdi: "images/khichdi.jpg",
    "paneer-butter": "images/paneer-butter.jpeg",
    "palak-paneer": "images/palak-paneer.jpg",
    chole: "images/chole.jpg",
    rajma: "images/rajma.jpg",
    "aloo-paratha": "images/aloo-paratha.jpg",
    poha: "images/poha.jpg",
    upma: "images/upma.jpg",
    idli: "images/idli.jpg",
    biryani: "images/biryani.jpg",
    "pav-bhaji": "images/pav-bhaji.jpg",
    bhindi: "images/bhindi.jpg",
    "curd-rice": "images/curd-rice.jpg",
    dhokla: "images/dhokla.jpg",
    kheer: "images/kheer.jpg",
    chai: "images/chai.jpg",
    "mango-lassi": "images/mango-lassi.jpg",
    chaas: "images/chaas.jpg",
    "nimbu-pani": "images/nimbu-pani.jpg",
    "filter-coffee": "images/filter-coffee.jpg",
    "badam-milk": "images/badam-milk.jpg",
    "aam-panna": "images/aam-panna.jpg",
    thandai: "images/thandai.jpg",
    "rose-sharbat": "images/rose-sharbat.jpg",
    "gulab-jamun": "images/gulab-jamun.jpg",
    "gajar-halwa": "images/gajar-halwa.jpg",
    rasmalai: "images/rasmalai.jpg",
    "sooji-halwa": "images/sooji-halwa.jpg",
    kulfi: "images/kulfi.jpg",
    "besan-ladoo": "images/besan-ladoo.jpg",
    shrikhand: "images/shrikhand.jpg",
    payasam: "images/payasam.jpg"
  };
  const PHOTO_CREDITS = {
    dal: { author: "Renupradhul", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Dal_tadka.JPG" },
    rice: { author: "Sonia Goyal", license: "CC BY-SA 2.0", file: "https://commons.wikimedia.org/wiki/File:Jeera-rice.JPG" },
    aloo: { author: "Sapanabehl", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Aloo_Ghobi.jpg" },
    roti: { author: "Famartin", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:2020-05-08_19_34_28_Chapati_being_made_in_a_pan_in_the_Franklin_Farm_section_of_Oak_Hill,_Fairfax_County,_Virginia.jpg" },
    dosa: { author: "Vee Satayamas from Bangkok, Thailand", license: "CC BY 2.0", file: "https://commons.wikimedia.org/wiki/File:Dosa_at_Sri_Ganesha_Restauran,_Bangkok_(44570742744).jpg" },
    khichdi: { author: "Rpande", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Dall_Khichdi.jpg" },
    "paneer-butter": { author: "Charvi Kakwani", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Paneer_Makhani_Veggie.jpeg" },
    "palak-paneer": { author: "Lopanayak", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Palakpaneer_Rayagada_Odisha_0009.jpg" },
    chole: { author: "Simon Law (sfllaw) from Montréal, QC, Canada", license: "CC BY-SA 2.0", file: "https://commons.wikimedia.org/wiki/File:Chana_masala.jpg" },
    rajma: { author: "Gaurav Nemade", license: "CC BY-SA 2.0", file: "https://commons.wikimedia.org/wiki/File:Rajma_Masala_(32081557778).jpg" },
    "aloo-paratha": { author: "Nithyasrm", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Triangle_paratha_(cropped).JPG" },
    poha: { author: "Sanjay Acharya, aka Sanjay ach at en.wikipedia", license: "CC BY-SA 3.0", file: "https://commons.wikimedia.org/wiki/File:Poha.jpg" },
    upma: { author: "Thamizhpparithi Maari", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:A_photo_of_Upma.jpg" },
    idli: { author: "Soumya dey at English Wikipedia", license: "CC BY-SA 3.0", file: "https://commons.wikimedia.org/wiki/File:Idli_Sambar.JPG" },
    biryani: { author: "Mahi Tatavarty", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:%22Hyderabadi_Dum_Biryani%22.jpg" },
    "pav-bhaji": { author: "Rupali Banarase", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Bambayya_Pav_bhaji.jpg" },
    bhindi: { author: "Monali.mishra", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Bhindi_Masala.jpg" },
    "curd-rice": { author: "Sudharshan Shanmugasundaram", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Curd_Rice.jpg" },
    dhokla: { author: "Devmanoj", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:SPECIAL_SURATI_KHAMAN.jpg" },
    kheer: { author: "stu spivack", license: "CC BY-SA 2.0", file: "https://commons.wikimedia.org/wiki/File:Kheer.jpg" },
    chai: { author: "Dadhichbittu007", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Chai_In_Sakora.jpg" },
    "mango-lassi": { author: "JIP", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Mango_lassi_at_Everest_Dine_in_November_2022.jpg" },
    chaas: { author: "Nitin", license: "CC BY-SA 2.0", file: "https://commons.wikimedia.org/wiki/File:Mint_lassi.jpg" },
    "nimbu-pani": { author: "Kanikatwl", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Shikanji-_served_with_pomegranate,grated_apple_and_mint.jpg" },
    "filter-coffee": { author: "Vallari.a", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Filter_kaapi.JPG" },
    "badam-milk": { author: "Amazing Almonds", license: "CC BY 2.0", file: "https://commons.wikimedia.org/wiki/File:Home-made_almond_milk,_November_2012.jpg" },
    "aam-panna": { author: "Miansari66", license: "CC0", file: "https://commons.wikimedia.org/wiki/File:Keri_Ka_Sharbat.JPG" },
    thandai: { author: "Aparna Balasubramanian", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Thandai_(Spiced_Indian_Milk_Drink).JPG" },
    "rose-sharbat": { author: "fa:User:دانقولا", license: "Public domain", file: "https://commons.wikimedia.org/wiki/File:Sharbat.JPG" },
    "gulab-jamun": { author: "Sapra5379", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Gulab-jamun-wallpaper-1.jpg" },
    "gajar-halwa": { author: "AmanAgrahari01", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Cuisine_(268)_44.jpg" },
    rasmalai: { author: "Shaharbano", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Ras_Malai_2.JPG" },
    "sooji-halwa": { author: "Munni Akter Mim", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:%E0%A6%B8%E0%A7%81%E0%A6%9C%E0%A6%BF%E0%A6%B0_%E0%A6%B9%E0%A6%BE%E0%A6%B2%E0%A7%81%E0%A6%AF%E0%A6%BC%E0%A6%BE.jpg" },
    kulfi: { author: "Commoner247", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Matka_kulfi.jpg" },
    "besan-ladoo": { author: "Nandhinikandhasamy", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Laddu_Sweet.JPG" },
    shrikhand: { author: "Secretlondon", license: "CC BY-SA 3.0", file: "https://commons.wikimedia.org/wiki/File:Shrikhand_london_kastoori.jpg" },
    payasam: { author: "Vis M", license: "CC BY-SA 4.0", file: "https://commons.wikimedia.org/wiki/File:Semiya_payasam,_Alappuzha.jpg" }
  };
  const dishImage = d => d.img || DISH_IMAGES[d.id] || '';
  // The photo sits before the letter; if it fails to load it removes itself and the letter shows instead.
  const photo = (d, cls) => { const src = dishImage(d); return src ? `<img class="${cls}" src="${esc(src)}" alt="${esc(d.name)}" loading="lazy" decoding="async" onerror="this.remove()">` : ''; };
  const dot = d => `<span class="picker-dot">${photo(d, 'dot-photo')}<span class="dot-letter">${esc(letter(d.name))}</span></span>`;
  function preloadDishImages() {
    Object.values(DISH_IMAGES).forEach(src => { const img = new Image(); img.decoding = 'async'; img.src = src; });
  }
  const SEED_PLAN = { mon: { lunch: 'dal', dinner: 'aloo' }, tue: { lunch: 'rice', dinner: 'roti' }, wed: { lunch: 'khichdi', dinner: null }, thu: { lunch: 'dosa', dinner: 'aloo' }, fri: { lunch: null, dinner: 'dal' }, sat: { lunch: 'dosa', dinner: null }, sun: { lunch: null, dinner: null } };
  const DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']];
  const MEALS = ['lunch', 'dinner'];
  const VIEWS = ['notebook', 'planner', 'shopping'];

  /* ---------- State: one notebook per account ---------- */
  let owner = 'guest';   // Supabase user id, or 'guest'
  let cloudOk = false;   // true when the Supabase `notebooks` table is reachable for this user
  let dishes = [];
  let plan = clone(SEED_PLAN);
  let checked = {};
  let extras = [];
  let filter = 'all';
  let pickerTarget = null;
  let dragged = null;
  let syncTimer;

  const localKey = () => `kf-notebook:${owner}`;
  const setSync = text => { $('#syncStatus').textContent = text; };
  const snapshot = () => ({ dishes, plan, checked, extras, seedVersion: SEED_VERSION, updatedAt: new Date().toISOString() });

  function applyNotebook(data) {
    dishes = Array.isArray(data?.dishes) ? data.dishes : clone(SEED_DISHES);
    plan = data?.plan || clone(SEED_PLAN);
    checked = data?.checked || {};
    extras = data?.extras || [];
    if ((data?.seedVersion || 1) < SEED_VERSION) {
      const known = new Set(dishes.map(d => d.id));
      const oldSeeds = new Set(['dal', 'rice', 'aloo', 'roti', 'dosa', 'khichdi']);
      const from = data?.seedVersion || 1;
      const addedIn = d => d.since || (oldSeeds.has(d.id) ? 1 : 2);
      dishes = [...dishes, ...clone(SEED_DISHES).filter(d => !known.has(d.id) && addedIn(d) > from)];
      if (from < 3) {
        const retag = { kheer: 'dessert', chai: 'drink' };
        dishes.forEach(d => { const t = retag[d.id]; if (t && d.tags && !d.tags.includes(t)) d.tags.push(t); });
      }
    }
    dishes.forEach((d, i) => { if (typeof d.hue !== 'number') d.hue = i % 6; d.tags = d.tags || []; d.ingredients = d.ingredients || []; });
    DAYS.forEach(([id]) => { plan[id] = plan[id] || { lunch: null, dinner: null }; });
  }

  const save = () => {
    const data = snapshot();
    store.set(localKey(), data);
    if (!cloudOk) return;
    clearTimeout(syncTimer);
    setSync('Saving…');
    syncTimer = setTimeout(async () => {
      const { error } = await sb.from('notebooks').upsert({ user_id: owner, data, updated_at: data.updatedAt }).then(r => r, e => ({ error: e }));
      setSync(error ? 'Saved on this device' : 'Synced to your account');
    }, 600);
  };

  async function loadNotebook(user) {
    owner = user ? user.id : 'guest';
    cloudOk = false;
    let data = store.get(localKey(), null);

    // Carry over the notebook from before accounts had their own copy.
    if (!data && owner === 'guest' && store.get('km-dishes', null)) {
      data = { dishes: store.get('km-dishes', null), plan: store.get('km-plan', null), checked: store.get('km-checked', {}), extras: store.get('km-extras', []), seedVersion: store.get('km-seed-version', 1) };
    }

    if (user && sb) {
      setSync('Loading your notebook…');
      try {
        const { data: row, error } = await sb.from('notebooks').select('data').eq('user_id', user.id).maybeSingle();
        if (!error) {
          cloudOk = true;
          if (row?.data && (!data || (row.data.updatedAt || '') >= (data.updatedAt || ''))) data = row.data;
        }
      } catch { cloudOk = false; }
    }

    applyNotebook(data);
    save();
    setSync(cloudOk ? 'Synced to your account' : 'Saved on this device');
  }
  const getDish = id => dishes.find(d => d.id === id);
  const letter = name => (name || '?').trim().charAt(0).toUpperCase();

  /* ---------- Dates ---------- */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIndex = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - todayIndex);
  const dayDate = i => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; };
  const formatRange = () => {
    const start = dayDate(0), end = dayDate(6);
    const month = d => d.toLocaleDateString('en-GB', { month: 'long' });
    return start.getMonth() === end.getMonth()
      ? `${start.getDate()} – ${end.getDate()} ${month(end)} ${end.getFullYear()}`
      : `${start.getDate()} ${month(start)} – ${end.getDate()} ${month(end)} ${end.getFullYear()}`;
  };

  /* ---------- Auth ---------- */
  const showScreen = id => {
    ['landingScreen', 'authScreen', 'appScreen'].forEach(s => { $(`#${s}`).hidden = s !== id; });
    window.scrollTo({ top: 0 });
  };
  const showLanding = () => { showScreen('landingScreen'); renderLanding(); };
  const showAuth = (mode = 'login') => {
    const toSignup = mode === 'signup';
    $('#loginForm').hidden = toSignup;
    $('#signupForm').hidden = !toSignup;
    setError($('#loginError'), ''); setError($('#signupError'), '');
    showScreen('authScreen');
    renderAuthDishes();
    $(toSignup ? '#signupName' : '#loginEmail').focus({ preventScroll: true });
  };

  /* Dishes shown beside the sign-in form */
  let authFilter = 'all';
  function renderAuthDishes() {
    const q = $('#authDishSearch').value.toLowerCase().trim();
    const list = SEED_DISHES.filter(d =>
      `${d.name} ${d.description} ${d.ingredients.join(' ')}`.toLowerCase().includes(q) &&
      (authFilter === 'all' || d.tags.includes(authFilter)));
    $('#authDishGrid').innerHTML = list.map((d, i) => `
      <article class="dish-card hue-${d.hue}" style="animation-delay:${i * 30}ms">
        <div class="dish-cover">
          ${photo(d, 'dish-photo')}<span class="dish-letter">${esc(letter(d.name))}</span>
          <div class="dish-badges">${d.tags.includes('quick') ? '<span class="badge">Quick</span>' : ''}${d.tags.includes('loved') ? '<span class="badge badge-loved">♥ Loved</span>' : ''}</div>
        </div>
        <div class="dish-body">
          <h3><button type="button" class="dish-open" data-preview-dish="${esc(d.id)}">${esc(d.name)}</button></h3>
          <p class="dish-desc">${esc(d.description)}</p>
          <div class="dish-meta"><span>${esc(d.servings)}</span><span>${esc(d.spice)}</span><span>${plural(d.ingredients.length, 'ingredient')}</span></div>
        </div>
      </article>`).join('');
    $('#authDishEmpty').hidden = list.length > 0;
    $('#authAllCount').textContent = SEED_DISHES.length;
  }
  $('#authDishSearch').addEventListener('input', renderAuthDishes);
  $$('[data-auth-filter]').forEach(btn => btn.addEventListener('click', () => {
    authFilter = btn.dataset.authFilter;
    $$('[data-auth-filter]').forEach(b => b.classList.toggle('active', b === btn));
    renderAuthDishes();
  }));
  $('#authDishGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-preview-dish]');
    if (!btn) return;
    const dish = SEED_DISHES.find(d => d.id === btn.dataset.previewDish);
    $$('#authDishGrid .dish-card').forEach(c => c.classList.toggle('is-picked', c.contains(btn)));
    const pick = $('#authPick');
    pick.textContent = `Sign in to add ${dish.name} to your week.`;
    pick.hidden = false;
    const field = $('#loginForm').hidden ? $('#signupName') : $('#loginEmail');
    if (matchMedia('(max-width: 900px)').matches) $('.auth-panel').scrollIntoView({ behavior: 'smooth' });
    field.focus({ preventScroll: true });
  });
  const startGuest = () => { store.set('km-guest', true); showApp(null, { openNotebook: true }); };

  function renderLanding() {
    $('#heroDishCount').textContent = SEED_DISHES.length;
    $$('.hero-dish-count').forEach(el => { el.textContent = SEED_DISHES.length; });
    $('#year').textContent = new Date().getFullYear();
  }

  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      const target = go.dataset.go;
      if (target === 'home') showLanding();
      else if (target === 'guest') startGuest();
      else if (!$('#landingScreen').hidden) focusHeroAuth(target);
      else showAuth(target);
      return;
    }
    const jump = e.target.closest('[data-scroll]');
    if (jump) {
      e.preventDefault();
      $(jump.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const showApp = async (user, { openNotebook = false } = {}) => {
    const guest = !user;
    const name = guest ? 'Guest cook' : (user.user_metadata?.name || user.email?.split('@')[0] || 'You');
    $('#userName').textContent = name;
    $('#userEmail').textContent = guest ? 'Guest · no account' : user.email;
    $('#userInitial').textContent = letter(name);
    $('#topUserName').textContent = name;
    $('#topUserInitial').textContent = letter(name);
    $('#topUserState').textContent = guest ? 'Not signed in' : 'Signed in';
    $('#topSignIn').hidden = !guest;
    $('#mobileLogout').hidden = guest;
    $('#notebookOwner').textContent = guest ? 'Guest notebook' : `${name.split(' ')[0]}'s notebook`;
    await loadNotebook(user);
    if (openNotebook) history.replaceState(null, '', '#notebook');
    showScreen('appScreen');
    renderAll();
    route();
  };

  const setError = (el, message, info = false) => {
    el.textContent = message;
    el.classList.toggle('is-info', info);
    el.hidden = !message;
  };
  const busy = (form, on) => { const b = $('button[type="submit"]', form); b.disabled = on; b.style.opacity = on ? .6 : ''; };

  async function submitLogin(e) {
    e.preventDefault();
    const form = e.currentTarget, err = $('.form-error', form);
    const email = form.elements.namedItem('email').value.trim(), password = form.elements.namedItem('password').value;
    if (!email || !password) return setError(err, 'Enter your email and password.');
    if (!sb) return setError(err, 'Sign-in is unavailable right now. You can still look around without an account.');
    busy(form, true); setError(err, '');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    busy(form, false);
    if (error) return setError(err, error.message);
    store.remove('km-guest');
    await showApp(data.user, { openNotebook: true });
    toast(`Welcome back, ${$('#userName').textContent.split(' ')[0]}!`);
  }

  async function submitSignup(e) {
    e.preventDefault();
    const form = e.currentTarget, err = $('.form-error', form);
    const name = form.elements.namedItem('fullname').value.trim();
    const email = form.elements.namedItem('email').value.trim(), password = form.elements.namedItem('password').value;
    if (!name || !email || !password) return setError(err, 'Please fill in all three fields.');
    if (password.length < 6) return setError(err, 'Passwords need at least 6 characters.');
    if (!sb) return setError(err, 'Sign-up is unavailable right now. You can still look around without an account.');
    busy(form, true); setError(err, '');
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
    busy(form, false);
    if (error) return setError(err, error.message);
    if (data.user) await sb.from('profiles').insert({ id: data.user.id, name, email }).then(() => {}, () => {});
    if (!data.session) return setError(err, 'Almost there — check your inbox to confirm your email, then sign in.', true);
    store.remove('km-guest');
    await showApp(data.user, { openNotebook: true });
    toast(`Your notebook is ready, ${name.split(' ')[0]}.`);
  }

  $$('[data-login-form]').forEach(f => f.addEventListener('submit', submitLogin));
  $$('[data-signup-form]').forEach(f => f.addEventListener('submit', submitSignup));

  /* Sign-in card on the homepage */
  function setHeroTab(mode) {
    const login = mode === 'login';
    $('#heroLoginForm').hidden = !login;
    $('#heroSignupForm').hidden = login;
    $$('[data-hero-tab]').forEach(t => {
      const on = t.dataset.heroTab === mode;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    $$('#heroAuth .form-error').forEach(el => setError(el, ''));
  }
  function focusHeroAuth(mode) {
    setHeroTab(mode);
    const card = $('#heroAuth');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
    $(mode === 'login' ? '#heroLoginForm input' : '#heroSignupForm input').focus({ preventScroll: true });
  }
  $$('[data-hero-tab]').forEach(t => t.addEventListener('click', () => setHeroTab(t.dataset.heroTab)));

  $$('[data-auth]').forEach(btn => btn.addEventListener('click', () => showAuth(btn.dataset.auth)));

  $('#guestButton').addEventListener('click', startGuest);

  const logout = async () => {
    store.remove('km-guest');
    if (sb) await sb.auth.signOut().catch(() => {});
    history.replaceState(null, '', location.pathname);
    showLanding();
    toast('Signed out.');
  };
  $('#logoutButton').addEventListener('click', logout);
  $('#mobileLogout').addEventListener('click', logout);
  $('#topSignIn').addEventListener('click', () => {
    store.remove('km-guest');
    history.replaceState(null, '', location.pathname);
    showAuth('login');
  });

  /* ---------- Routing ---------- */
  function route() {
    if ($('#appScreen').hidden) return;
    const hash = location.hash.slice(1);
    const view = VIEWS.includes(hash) ? hash : 'notebook';
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === view));
    if (view === 'shopping') renderShopping();
    window.scrollTo({ top: 0 });
  }
  window.addEventListener('hashchange', route);

  /* ---------- Notebook ---------- */
  function renderDishes() {
    const q = $('#dishSearch').value.toLowerCase().trim();
    const list = dishes.filter(d => {
      const text = `${d.name} ${d.description} ${d.notes} ${d.ingredients.join(' ')}`.toLowerCase();
      return text.includes(q) && (filter === 'all' || d.tags.includes(filter));
    });

    const cards = list.map((d, i) => `
      <article class="dish-card hue-${d.hue}" style="animation-delay:${i * 40}ms">
        <div class="dish-cover">
          ${photo(d, 'dish-photo')}<span class="dish-letter">${esc(letter(d.name))}</span>
          <div class="dish-badges">${d.tags.includes('quick') ? '<span class="badge">Quick</span>' : ''}${d.tags.includes('loved') ? '<span class="badge badge-loved">♥ Loved</span>' : ''}</div>
        </div>
        <div class="dish-body">
          <h3><button class="dish-open" data-dish="${esc(d.id)}">${esc(d.name)}</button></h3>
          <p class="dish-desc">${esc(d.description || d.notes || 'A dish saved in your household notebook.')}</p>
          <div class="dish-meta">${d.servings ? `<span>${esc(d.servings)}</span>` : ''}<span>${esc(d.spice || 'Gentle')}</span><span>${plural(d.ingredients.length, 'ingredient')}</span></div>
        </div>
      </article>`).join('');

    const addCard = !q && filter === 'all' ? '<button class="dish-add" data-new-dish><svg class="icon"><use href="#i-plus"/></svg>Add a dish</button>' : '';
    $('#dishGrid').innerHTML = cards + addCard;
    $('#dishGrid').hidden = !list.length && !addCard;
    $('#dishEmpty').hidden = list.length > 0 || !!addCard;
    $('#filterAllCount').textContent = dishes.length;
    $('#navDishCount').textContent = dishes.length;
  }

  $('#dishSearch').addEventListener('input', renderDishes);
  $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    $$('[data-filter]').forEach(b => b.classList.toggle('active', b === btn));
    renderDishes();
  }));
  document.addEventListener('click', e => {
    if (e.target.closest('[data-new-dish]')) openDish();
    const open = e.target.closest('[data-dish]');
    if (open) openDish(open.dataset.dish);
    if (e.target.closest('[data-open-members]') || e.target.closest('#householdButton')) $('#memberModal').showModal();
  });

  /* ---------- Dish dialog ---------- */
  function openDish(id = null) {
    const d = id ? getDish(id) : null;
    $('#dishId').value = d?.id || '';
    $('#dishModalEyebrow').textContent = d ? 'Edit dish' : 'New dish';
    $('#dishModalTitle').textContent = d ? d.name : 'Save a dish';
    const src = d ? dishImage(d) : '';
    const credit = d && PHOTO_CREDITS[d.id];
    $('#dishPhoto').hidden = !src;
    $('#dishPhotoImg').src = src;
    $('#dishPhotoImg').alt = d ? `Photo of ${d.name}` : '';
    $('#dishPhotoCredit').innerHTML = credit
      ? `Photo: ${esc(credit.author)} · <a href="${esc(credit.file)}" target="_blank" rel="noopener">${esc(credit.license)}, Wikimedia Commons</a>`
      : '';
    $('#dishName').value = d?.name || '';
    $('#dishServings').value = d?.servings || '';
    $('#dishSpice').value = d?.spice || 'Gentle';
    $('#dishIngredients').value = d?.ingredients.join('\n') || '';
    $('#dishMethod').value = d?.method || '';
    $('#dishNotes').value = d?.notes || '';
    $('#dishQuick').checked = !!d?.tags.includes('quick');
    $('#dishLoved').checked = !!d?.tags.includes('loved');
    $('#deleteDishButton').hidden = !d;
    aiDraft = null;
    setAiStatus('');
    $('#aiFillButton').textContent = d ? '✨ Rewrite with AI' : '✨ Write with AI';
    $('#dishModal').showModal();
    if (!d) $('#dishName').focus();
  }

  /* ---------- AI recipe writer (server.js → Claude) ---------- */
  let aiDraft = null;       // { description, category } from the last AI reply, used when saving
  let aiBusy = false;
  function setAiStatus(text, kind = '') {
    const el = $('#aiStatus');
    el.textContent = text;
    el.className = `ai-status${kind ? ` is-${kind}` : ''}`;
    el.hidden = !text;
  }

  async function writeWithAi({ auto = false } = {}) {
    const name = $('#dishName').value.trim();
    if (aiBusy) return;
    if (name.length < 2) {
      if (!auto) { setAiStatus('Type the dish name first, then the AI can write the recipe.', 'error'); $('#dishName').focus(); }
      return;
    }
    const fields = ['#dishIngredients', '#dishMethod', '#dishNotes'].map(sel => $(sel));
    const hasText = fields.some(f => f.value.trim());
    if (hasText && !auto && !confirm('Replace the ingredients, method and notes with an AI-written version?')) return;

    aiBusy = true;
    $('#aiFillButton').disabled = true;
    fields.forEach(f => f.classList.add('is-generating'));
    setAiStatus(`Writing a recipe for ${name}…`);
    try {
      const res = await fetch('/api/generate-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, servings: $('#dishServings').value.trim(), spice: $('#dishSpice').value })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        const fallback = res.status === 404 || res.status === 501
          ? 'AI needs the Kitchen Food server. Start it with "npm start" and open the link it prints.'
          : 'The AI could not write this recipe. Please try again.';
        throw new Error(data?.error || fallback);
      }
      if ($('#dishName').value.trim() !== name) return;   // name changed while waiting
      $('#dishIngredients').value = data.ingredients.join('\n');
      $('#dishMethod').value = data.method;
      $('#dishNotes').value = data.notes;
      $('#dishQuick').checked = data.quick;
      aiDraft = { description: data.description, category: data.category };
      setAiStatus('✓ Written by AI. Check the quantities and edit anything before saving.', 'done');
    } catch (err) {
      setAiStatus(err.message === 'Failed to fetch' ? 'Could not reach the AI server. Is "npm start" running?' : err.message, 'error');
    } finally {
      aiBusy = false;
      $('#aiFillButton').disabled = false;
      fields.forEach(f => f.classList.remove('is-generating'));
    }
  }

  $('#aiFillButton').addEventListener('click', () => writeWithAi());
  // New dish: once a name is typed and the recipe fields are still empty, write it automatically.
  $('#dishName').addEventListener('change', () => {
    const isNew = !$('#dishId').value;
    const empty = ['#dishIngredients', '#dishMethod'].every(sel => !$(sel).value.trim());
    if (isNew && empty) writeWithAi({ auto: true });
  });

  $('#dishForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#dishName').value.trim();
    if (!name) { $('#dishName').focus(); return; }
    const id = $('#dishId').value || `dish-${Date.now()}`;
    const old = getDish(id);
    const notes = $('#dishNotes').value.trim(), method = $('#dishMethod').value.trim();
    const dish = {
      id, name,
      hue: old ? old.hue : dishes.length % 6,
      servings: $('#dishServings').value.trim(),
      spice: $('#dishSpice').value,
      ingredients: $('#dishIngredients').value.split('\n').map(s => s.trim()).filter(Boolean),
      method, notes,
      description: aiDraft?.description || (old?.description && old.notes === notes ? old.description : (notes || method || 'A dish saved in your household notebook.')),
      tags: [...new Set([...(old?.tags || []).filter(t => t !== 'quick' && t !== 'loved'), ['dessert', 'drink'].includes(aiDraft?.category) && aiDraft.category, $('#dishQuick').checked && 'quick', $('#dishLoved').checked && 'loved'].filter(Boolean))]
    };
    dishes = old ? dishes.map(d => d.id === id ? dish : d) : [dish, ...dishes];
    save(); renderAll();
    $('#dishModal').close();
    toast(old ? 'Dish updated.' : 'Dish saved to the notebook.');
  });

  $('#deleteDishButton').addEventListener('click', () => {
    const d = getDish($('#dishId').value);
    if (!d || !confirm(`Delete “${d.name}” from the notebook?`)) return;
    dishes = dishes.filter(x => x.id !== d.id);
    DAYS.forEach(([day]) => MEALS.forEach(m => { if (plan[day][m] === d.id) plan[day][m] = null; }));
    save(); renderAll();
    $('#dishModal').close();
    toast('Dish removed.');
  });

  /* ---------- Planner ---------- */
  function renderPlanner() {
    let planned = 0, open = 0;
    const used = new Set();
    $('#weekGrid').innerHTML = DAYS.map(([id, label], i) => {
      const slots = MEALS.map(type => {
        const value = plan[id][type];
        const attrs = `data-day="${id}" data-type="${type}"`;
        if (value === 'skipped') {
          return `<div class="slot is-skipped" ${attrs}><span class="slot-type">${type}</span><span class="slot-name">Skipped</span><div class="slot-actions"><button data-pick aria-label="Choose a dish" title="Choose a dish"><svg class="icon icon-sm"><use href="#i-swap"/></svg></button></div></div>`;
        }
        const dish = value && getDish(value);
        if (!dish) {
          open++;
          return `<button class="slot is-empty" ${attrs} data-pick><span class="slot-type">${type}</span><span class="slot-add">+ Add ${type}</span></button>`;
        }
        planned++; used.add(dish.id);
        return `<div class="slot is-filled hue-${dish.hue}" ${attrs} draggable="true"><span class="slot-type">${type}</span><span class="slot-name">${esc(dish.name)}</span><div class="slot-actions"><button data-pick aria-label="Change dish" title="Change dish"><svg class="icon icon-sm"><use href="#i-swap"/></svg></button><button data-skip aria-label="Skip meal" title="Skip meal"><svg class="icon icon-sm"><use href="#i-skip"/></svg></button></div></div>`;
      }).join('');
      const isToday = i === todayIndex;
      return `<section class="day${isToday ? ' is-today' : ''}"><header class="day-head"><span>${label.slice(0, 3)}</span><strong>${dayDate(i).getDate()}</strong>${isToday ? '<em>Today</em>' : ''}</header>${slots}</section>`;
    }).join('');
    $('#weekRange').textContent = formatRange();
    $('#statPlanned').textContent = planned;
    $('#statOpen').textContent = open;
    $('#statDishes').textContent = used.size;
    $('#navMealCount').textContent = planned;
  }

  $('#weekGrid').addEventListener('click', e => {
    const slot = e.target.closest('[data-day]');
    if (!slot) return;
    const { day, type } = slot.dataset;
    if (e.target.closest('[data-skip]')) {
      plan[day][type] = 'skipped';
      save(); renderPlanner(); renderShopping();
      toast('Meal skipped.');
    } else if (e.target.closest('[data-pick]')) {
      openPicker(day, type);
    }
  });

  $('#weekGrid').addEventListener('dragstart', e => {
    const slot = e.target.closest('.slot.is-filled');
    if (!slot) return;
    dragged = { day: slot.dataset.day, type: slot.dataset.type };
    slot.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  $('#weekGrid').addEventListener('dragend', () => { dragged = null; $$('.slot').forEach(s => s.classList.remove('dragging', 'drop-target')); });
  $('#weekGrid').addEventListener('dragover', e => {
    const slot = e.target.closest('.slot');
    if (!slot || !dragged) return;
    e.preventDefault();
    $$('.slot.drop-target').forEach(s => s !== slot && s.classList.remove('drop-target'));
    slot.classList.add('drop-target');
  });
  $('#weekGrid').addEventListener('drop', e => {
    const slot = e.target.closest('.slot');
    if (!slot || !dragged) return;
    e.preventDefault();
    const { day, type } = slot.dataset;
    if (day === dragged.day && type === dragged.type) return;
    const moving = plan[dragged.day][dragged.type];
    const target = plan[day][type];
    plan[day][type] = moving;
    plan[dragged.day][dragged.type] = target && target !== 'skipped' ? target : null;
    dragged = null;
    save(); renderPlanner();
    toast(target && target !== 'skipped' ? 'Meals swapped.' : 'Meal moved.');
  });

  $('#resetWeekButton').addEventListener('click', () => {
    plan = clone(SEED_PLAN);
    save(); renderPlanner(); renderShopping();
    toast('A familiar week has been filled in.');
  });

  /* ---------- Meal picker ---------- */
  function openPicker(day, type) {
    pickerTarget = { day, type };
    const dayName = DAYS.find(([id]) => id === day)[1];
    $('#pickerTitle').textContent = `${dayName} ${type}`;
    $('#pickerSearch').value = '';
    renderPicker();
    $('#pickerModal').showModal();
    $('#pickerSearch').focus();
  }

  function renderPicker() {
    const q = $('#pickerSearch').value.toLowerCase().trim();
    const current = plan[pickerTarget.day][pickerTarget.type];
    const list = dishes.filter(d => d.name.toLowerCase().includes(q));
    $('#pickerList').innerHTML = list.length ? list.map(d => `
      <button class="picker-item hue-${d.hue}${d.id === current ? ' is-current' : ''}" data-pick-dish="${esc(d.id)}">
        ${dot(d)}
        <span><strong>${esc(d.name)}</strong><small>${[d.servings, d.tags.includes('quick') && 'quick', d.tags.includes('loved') && 'family loved'].filter(Boolean).map(esc).join(' · ')}</small></span>
      </button>`).join('') : '<p class="picker-empty">No dish by that name yet.</p>';
  }

  $('#pickerSearch').addEventListener('input', renderPicker);
  $('#pickerSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); $('#pickerList [data-pick-dish]')?.click(); }
  });
  const setSlot = (value, message) => {
    const { day, type } = pickerTarget;
    plan[day][type] = value;
    save(); renderPlanner(); renderShopping();
    $('#pickerModal').close();
    toast(message);
  };
  $('#pickerList').addEventListener('click', e => {
    const btn = e.target.closest('[data-pick-dish]');
    if (btn) setSlot(btn.dataset.pickDish, `${getDish(btn.dataset.pickDish).name} added to ${$('#pickerTitle').textContent}.`);
  });
  $('#pickerSkip').addEventListener('click', () => setSlot('skipped', 'Meal skipped.'));
  $('#pickerClear').addEventListener('click', () => setSlot(null, 'Slot left open.'));

  /* ---------- Shopping ---------- */
  const QTY = /^((?:\d[\d./]*|an?)\s*(?:cups?|tbsp|tsp|kg|g|ml|l|pieces?|small handful|handful|pinch|small|medium|large)?(?:\s+of)?)\s+(.+)$/i;
  const SPICE = /powder|turmeric|cumin|salt|bay leaf|ghee|oil|masala|seeds|chilli flakes/i;
  const FRESH = /tomato|onion|coriander|potato|cauliflower|carrot|garlic|ginger|chilli|lemon|spinach|peas|batter|curd|milk|paneer/i;

  function gatherList() {
    const ids = [...new Set(DAYS.flatMap(([d]) => MEALS.map(m => plan[d][m])).filter(v => v && v !== 'skipped'))];
    const planned = ids.map(getDish).filter(Boolean);
    const items = new Map();
    planned.forEach(dish => dish.ingredients.forEach(raw => {
      const m = raw.match(QTY);
      const qty = m ? m[1].replace(/\s+of$/i, '').trim() : '';
      const name = (m ? m[2] : raw).replace(/,.*$/, '').replace(/^fresh\s+/i, '').trim();
      const key = name.toLowerCase().replace(/es$|s$/, '').trim();
      const item = items.get(key) || { key, name, qtys: [], sources: [], extra: false };
      if (qty) item.qtys.push(qty);
      if (!item.sources.includes(dish.name)) item.sources.push(dish.name);
      items.set(key, item);
    }));
    extras.forEach(name => {
      const key = `extra:${name.toLowerCase()}`;
      if (!items.has(key)) items.set(key, { key, name, qtys: [], sources: [], extra: true });
    });

    const groups = { 'Fresh things': [], 'Pantry staples': [], 'Spices & extras': [], 'Added by you': [] };
    items.forEach(item => {
      if (item.extra) groups['Added by you'].push(item);
      else if (SPICE.test(item.name)) groups['Spices & extras'].push(item);
      else if (FRESH.test(item.name)) groups['Fresh things'].push(item);
      else groups['Pantry staples'].push(item);
    });
    return { planned, items: [...items.values()], groups };
  }

  function renderShopping() {
    const { planned, items, groups } = gatherList();
    const done = items.filter(i => checked[i.key]).length;
    const left = items.length - done;

    $('#shoppingLede').textContent = planned.length
      ? `${plural(items.length, 'thing')} gathered from ${plural(planned.length, 'planned dish', 'planned dishes')}.`
      : 'Plan a few meals and their ingredients will gather here.';
    $('#progressLabel').textContent = items.length ? `${done} of ${items.length} in the basket` : 'Your list is empty';
    $('#progressDetail').textContent = !items.length ? 'Add a meal or type something below.' : left ? 'Tap an item when it makes it into the basket.' : 'Everything is checked off. Nice work.';
    $('#progressBar').style.width = items.length ? `${(done / items.length) * 100}%` : '0%';

    let n = 0;
    $('#shoppingGroups').innerHTML = items.length ? Object.entries(groups).filter(([, g]) => g.length).map(([title, group]) => `
      <section class="shop-group"><h3>${title}</h3>${group.map(item => {
        const id = `shop-${n++}`;
        const isChecked = !!checked[item.key];
        const qty = item.qtys.length && item.qtys.every(q => /^\d+$/.test(q))
          ? String(item.qtys.reduce((sum, q) => sum + Number(q), 0))
          : item.qtys.join(' + ');
        return `<label class="shop-item${isChecked ? ' checked' : ''}" for="${id}">
          <input type="checkbox" id="${id}" data-key="${esc(item.key)}"${isChecked ? ' checked' : ''} />
          <span class="shop-text"><span class="shop-name">${esc(item.name)}</span>${qty ? `<span class="shop-qty">${esc(qty)}</span>` : ''}${item.sources.length ? `<span class="shop-src">For ${esc(item.sources.join(', '))}</span>` : ''}</span>
          ${item.extra ? `<button type="button" class="shop-remove" data-remove="${esc(item.name)}" aria-label="Remove ${esc(item.name)}"><svg class="icon icon-sm"><use href="#i-x"/></svg></button>` : ''}
        </label>`;
      }).join('')}</section>`).join('') : `
      <div class="empty" style="margin-top:24px"><span class="empty-mark"><svg class="icon"><use href="#i-basket"/></svg></span><h2>A clear counter</h2><p>Choose a few dishes for the week and their ingredients will collect here.</p><a class="btn btn-ghost" href="#planner">Plan a meal</a></div>`;

    $('#plannedSummary').innerHTML = planned.length
      ? planned.map(d => `<div class="planned-dish hue-${d.hue}">${dot(d)}<span><strong>${esc(d.name)}</strong><small>${plural(d.ingredients.length, 'ingredient')}</small></span></div>`).join('')
      : '<p class="muted" style="margin:0 0 8px;font-size:14px">No dishes planned yet.</p>';

    $('#navShopCount').textContent = left;
    $('#navShopCount').toggleAttribute('data-zero', left === 0);
    $('#tabShopCount').textContent = left;
    $('#tabShopCount').hidden = left === 0;
  }

  $('#shoppingGroups').addEventListener('change', e => {
    const key = e.target.dataset.key;
    if (!key) return;
    if (e.target.checked) checked[key] = true; else delete checked[key];
    save(); renderShopping();
  });
  $('#shoppingGroups').addEventListener('click', e => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    e.preventDefault();
    const name = btn.dataset.remove;
    extras = extras.filter(x => x !== name);
    delete checked[`extra:${name.toLowerCase()}`];
    save(); renderShopping();
  });
  $('#addItemForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#addItemInput');
    const name = input.value.trim();
    if (!name) return;
    if (!extras.some(x => x.toLowerCase() === name.toLowerCase())) extras.push(name);
    input.value = '';
    save(); renderShopping();
    toast(`${name} added to the list.`);
  });
  $('#clearCheckedButton').addEventListener('click', () => {
    const count = Object.keys(checked).length;
    if (!count) { toast('Nothing checked yet.'); return; }
    extras = extras.filter(x => !checked[`extra:${x.toLowerCase()}`]);
    checked = {};
    save(); renderShopping();
    toast(`Cleared ${plural(count, 'item')}.`);
  });

  /* ---------- Dialogs ---------- */
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', e => {
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
  });
  $('#inviteButton').addEventListener('click', async () => {
    const link = `${location.origin}${location.pathname}`;
    try { await navigator.clipboard.writeText(link); toast('Invite link copied.'); } catch { toast(`Share this link: ${link}`); }
    $('#memberModal').close();
  });

  /* ---------- Start ---------- */
  function renderAll() { renderDishes(); renderPlanner(); renderShopping(); }

  preloadDishImages();

  (async () => {
    let user = null;
    if (sb) {
      try { user = (await sb.auth.getSession()).data.session?.user || null; } catch { user = null; }
    }
    if (user) showApp(user);
    else if (store.get('km-guest', false)) showApp(null);
    else showLanding();
  })();
})();
