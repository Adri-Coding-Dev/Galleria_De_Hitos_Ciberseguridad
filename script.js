let trophies = JSON.parse(localStorage.getItem('cyberTrophies')) || [];
        let currentEditingIndex = -1;
        let currentTrophyScreenshots = [];

        // Inicialización cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        function initializeApp() {
            renderTrophies();
            setupEventListeners();
            // Establecer fecha actual por defecto
            const dateInput = document.getElementById('date');
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
        }

        function setupEventListeners() {
            // Event listener para el formulario
            const form = document.getElementById('trophyForm');
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
            }

            // Event listener para imagen principal
            const imageInput = document.getElementById('image');
            if (imageInput) {
                imageInput.addEventListener('change', handleImageUpload);
            }

            // Event listener para capturas múltiples
            const screenshotsInput = document.getElementById('screenshots');
            if (screenshotsInput) {
                screenshotsInput.addEventListener('change', handleScreenshotsUpload);
            }
        }

        function handleFormSubmit(e) {
            e.preventDefault();
            console.log('Formulario enviado');
            
            try {
                // Obtener imagen principal de manera segura
                let imageData = '';
                const imagePreview = document.getElementById('imagePreview');
                const imgElement = imagePreview ? imagePreview.querySelector('img') : null;
                if (imgElement && imgElement.src) {
                    imageData = imgElement.src;
                }
                
                const formData = {
                    title: document.getElementById('title').value.trim(),
                    image: imageData,
                    categories: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
                    difficulty: document.getElementById('difficulty').value,
                    date: document.getElementById('date').value,
                    summary: document.getElementById('summary').value.trim(),
                    experience: document.getElementById('experience').value.trim(),
                    screenshots: [...currentTrophyScreenshots],
                    id: currentEditingIndex >= 0 ? trophies[currentEditingIndex].id : Date.now() + Math.random()
                };

                // Validar campos requeridos
                if (!formData.title) {
                    alert('El título es requerido');
                    return;
                }
                
                if (!formData.difficulty) {
                    alert('La dificultad es requerida');
                    return;
                }
                
                if (!formData.date) {
                    alert('La fecha es requerida');
                    return;
                }

                console.log('Datos del formulario validados:', {
                    title: formData.title,
                    categories: formData.categories.length,
                    hasImage: !!formData.image,
                    screenshots: formData.screenshots.length
                });

                if (currentEditingIndex >= 0) {
                    trophies[currentEditingIndex] = formData;
                    console.log('Trofeo editado en índice:', currentEditingIndex);
                } else {
                    trophies.push(formData);
                    console.log('Nuevo trofeo añadido. Total trofeos:', trophies.length);
                }

                saveTrophies();
                renderTrophies();
                closeModal();
                
            } catch (error) {
                console.error('Error al procesar formulario:', error);
                alert('Error al guardar el trofeo. Por favor, inténtalo de nuevo.');
            }
        }

        function handleImageUpload(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('imagePreview');
            
            if (file) {
                // Validar que sea una imagen
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecciona un archivo de imagen válido');
                    e.target.value = '';
                    return;
                }
                
                // Validar tamaño (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen es demasiado grande. Máximo 5MB');
                    e.target.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        preview.innerHTML = `<img src="${event.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin-top: 10px; border: 2px solid #00ff41;">`;
                        console.log('Imagen cargada correctamente');
                    } catch (error) {
                        console.error('Error al mostrar imagen:', error);
                        preview.innerHTML = '<p style="color: #ff4757;">Error al cargar imagen</p>';
                    }
                };
                reader.onerror = function() {
                    console.error('Error al leer el archivo');
                    alert('Error al leer el archivo de imagen');
                    preview.innerHTML = '';
                };
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = '';
            }
        }

        function handleScreenshotsUpload(e) {
            const files = Array.from(e.target.files);
            
            if (files.length === 0) return;
            
            files.forEach(file => {
                // Validar que sea una imagen
                if (!file.type.startsWith('image/')) {
                    console.log('Archivo no válido ignorado:', file.name);
                    return;
                }
                
                // Validar tamaño (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`La imagen ${file.name} es demasiado grande. Máximo 5MB`);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        currentTrophyScreenshots.push(event.target.result);
                        updateScreenshotsPreview();
                        console.log('Screenshot añadido, total:', currentTrophyScreenshots.length);
                    } catch (error) {
                        console.error('Error al procesar screenshot:', error);
                    }
                };
                reader.onerror = function() {
                    console.error('Error al leer screenshot:', file.name);
                };
                reader.readAsDataURL(file);
            });
            
            // Limpiar input para permitir subir las mismas imágenes otra vez
            e.target.value = '';
        }

        function openAddModal() {
            currentEditingIndex = -1;
            currentTrophyScreenshots = [];
            document.getElementById('modalTitle').textContent = 'Añadir Nuevo Trofeo';
            document.getElementById('trophyForm').reset();
            
            // Restablecer fecha actual
            const dateInput = document.getElementById('date');
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
            
            // Limpiar previsualizaciones
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('screenshotsPreview').innerHTML = '';
            
            // Mostrar modal
            document.getElementById('trophyModal').style.display = 'block';
            
            console.log('Modal abierto para añadir'); // Debug
        }

        function closeModal() {
            document.getElementById('trophyModal').style.display = 'none';
        }

        function closeDetailsModal() {
            document.getElementById('detailsModal').style.display = 'none';
        }

        function closeWriteup() {
            document.getElementById('writeupPage').style.display = 'none';
        }

        // Previsualización de imagen principal
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('image').addEventListener('change', function(e) {
                const file = e.target.files[0];
                const preview = document.getElementById('imagePreview');
                
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin-top: 10px; border: 2px solid #00ff41;">`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    preview.innerHTML = '';
                }
            });

            // Manejo de capturas múltiples
            document.getElementById('screenshots').addEventListener('change', function(e) {
                const files = Array.from(e.target.files);
                
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        currentTrophyScreenshots.push(e.target.result);
                        updateScreenshotsPreview();
                    };
                    reader.readAsDataURL(file);
                });
            });
        });



        function updateScreenshotsPreview() {
            const preview = document.getElementById('screenshotsPreview');
            if (!preview) return;
            
            try {
                preview.innerHTML = currentTrophyScreenshots.map((src, index) => `
                    <div class="screenshot-item">
                        <img src="${src}" alt="Screenshot ${index + 1}" style="max-width: 100%; height: auto;">
                        <button type="button" class="screenshot-remove" onclick="removeScreenshot(${index})">×</button>
                    </div>
                `).join('');
                console.log('Screenshots preview actualizado:', currentTrophyScreenshots.length);
            } catch (error) {
                console.error('Error al actualizar preview de screenshots:', error);
                preview.innerHTML = '<p style="color: #ff4757;">Error al mostrar capturas</p>';
            }
        }

        function removeScreenshot(index) {
            try {
                currentTrophyScreenshots.splice(index, 1);
                updateScreenshotsPreview();
                console.log('Screenshot eliminado, restantes:', currentTrophyScreenshots.length);
            } catch (error) {
                console.error('Error al eliminar screenshot:', error);
            }
        }



        function editTrophy(index) {
            console.log('Editando trofeo:', index); // Debug
            currentEditingIndex = index;
            const trophy = trophies[index];
            
            document.getElementById('modalTitle').textContent = 'Editar Trofeo';
            
            // Llenar campos del formulario
            document.getElementById('title').value = trophy.title || '';
            document.getElementById('difficulty').value = trophy.difficulty || '';
            document.getElementById('date').value = trophy.date || '';
            document.getElementById('summary').value = trophy.summary || '';
            document.getElementById('experience').value = trophy.experience || '';
            
            // Categorías
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = trophy.categories && trophy.categories.includes(cb.value);
            });
            
            // Imagen principal
            const imagePreview = document.getElementById('imagePreview');
            if (trophy.image) {
                imagePreview.innerHTML = `<img src="${trophy.image}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin-top: 10px; border: 2px solid #00ff41;">`;
            } else {
                imagePreview.innerHTML = '';
            }
            
            // Screenshots
            currentTrophyScreenshots = [...(trophy.screenshots || [])];
            updateScreenshotsPreview();
            
            // Mostrar modal
            document.getElementById('trophyModal').style.display = 'block';
            
            console.log('Modal abierto para editar, datos cargados'); // Debug
        }

        function deleteTrophy(index) {
            if (confirm('¿Estás seguro de que quieres eliminar este trofeo?')) {
                trophies.splice(index, 1);
                saveTrophies();
                renderTrophies();
            }
        }

        function showDetails(index) {
            const trophy = trophies[index];
            const modal = document.getElementById('detailsModal');
            
            document.getElementById('detailsTitle').textContent = trophy.title;
            document.getElementById('detailsContent').innerHTML = `
                <div style="margin-bottom: 20px;">
                    ${trophy.image ? `<img src="${trophy.image}" style="width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">` : ''}
                    <div style="margin-bottom: 15px;">
                        <strong>Categorías:</strong> ${trophy.categories.join(', ') || 'Sin categoría'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Dificultad:</strong> <span class="difficulty-tag difficulty-${trophy.difficulty}">${trophy.difficulty}</span>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Fecha:</strong> ${new Date(trophy.date).toLocaleDateString('es-ES')}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Resumen:</strong><br>${trophy.summary || 'Sin resumen'}
                    </div>
                    <div>
                        <strong>Experiencia:</strong><br>${trophy.experience || 'Sin experiencia registrada'}
                    </div>
                </div>
            `;
            
            document.getElementById('viewWriteupBtn').onclick = () => showWriteup(index);
            modal.style.display = 'block';
        }

        function showWriteup(index) {
            const trophy = trophies[index];
            closeDetailsModal();
            
            document.getElementById('writeupTitle').textContent = `Write-up: ${trophy.title}`;
            document.getElementById('writeupMeta').innerHTML = `
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                    <span class="difficulty-tag difficulty-${trophy.difficulty}">${trophy.difficulty}</span>
                    ${trophy.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                    <span style="color: #888;">${new Date(trophy.date).toLocaleDateString('es-ES')}</span>
                </div>
            `;
            
            document.getElementById('writeupExperience').innerHTML = `
                <div style="background: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #00ff41;">
                    <h3 style="color: #00ff41; margin-bottom: 15px;">💡 Experiencia y Aprendizajes</h3>
                    <p style="color: #ccc; line-height: 1.6;">${trophy.experience || 'Sin experiencia registrada'}</p>
                </div>
            `;
            
            const screenshotsHtml = trophy.screenshots && trophy.screenshots.length > 0 
                ? trophy.screenshots.map((src, i) => `
                    <div class="writeup-screenshot">
                        <img src="${src}" alt="Screenshot ${i + 1}">
                    </div>
                `).join('')
                : '<p style="text-align: center; color: #888;">No hay capturas disponibles</p>';
            
            document.getElementById('writeupScreenshots').innerHTML = screenshotsHtml;
            document.getElementById('writeupPage').style.display = 'block';
        }

        function renderTrophies() {
            const container = document.getElementById('trophiesContainer');
            const categoryFilter = document.getElementById('categoryFilter').value;
            const difficultyFilter = document.getElementById('difficultyFilter').value;
            
            let filteredTrophies = trophies.filter(trophy => {
                const matchesCategory = !categoryFilter || trophy.categories.includes(categoryFilter);
                const matchesDifficulty = !difficultyFilter || trophy.difficulty === difficultyFilter;
                return matchesCategory && matchesDifficulty;
            });

            if (filteredTrophies.length === 0) {
                container.innerHTML = `
                    <div class="no-trophies">
                        <h3>🔍 No se encontraron trofeos</h3>
                        <p>No hay trofeos que coincidan con los filtros seleccionados.</p>
                        ${trophies.length === 0 ? '<p>¡Añade tu primer trofeo para comenzar!</p>' : ''}
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredTrophies.map((trophy, index) => {
                const originalIndex = trophies.indexOf(trophy);
                return `
                    <div class="trophy-card" onclick="showDetails(${originalIndex})">
                        ${trophy.image ? `<img src="${trophy.image}" alt="${trophy.title}" class="trophy-image">` : 
                          `<div class="trophy-image" style="display: flex; align-items: center; justify-content: center; background: rgba(0, 255, 65, 0.1); color: #00ff41; font-size: 3rem;">🏆</div>`}
                        
                        <h3 class="trophy-title">${trophy.title}</h3>
                        
                        <div class="trophy-meta">
                            ${trophy.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                            <span class="difficulty-tag difficulty-${trophy.difficulty}">${trophy.difficulty}</span>
                        </div>
                        
                        <div class="trophy-date">📅 ${new Date(trophy.date).toLocaleDateString('es-ES')}</div>
                        
                        ${trophy.summary ? `<div class="trophy-summary">${trophy.summary}</div>` : ''}
                        
                        <div class="trophy-actions" onclick="event.stopPropagation()">
                            <button class="btn btn-primary btn-sm" onclick="showDetails(${originalIndex})">👁️ Ver Más</button>
                            <button class="btn btn-secondary btn-sm" onclick="editTrophy(${originalIndex})">✏️ Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteTrophy(${originalIndex})">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function filterTrophies() {
            renderTrophies();
        }

        function saveTrophies() {
            try {
                localStorage.setItem('cyberTrophies', JSON.stringify(trophies));
                console.log('Trofeos guardados:', trophies.length); // Debug
            } catch (error) {
                console.error('Error al guardar trofeos:', error);
                alert('Error al guardar los trofeos');
            }
        }

        function exportTrophies() {
            if (trophies.length === 0) {
                alert('No hay trofeos para exportar');
                return;
            }
            
            const dataStr = JSON.stringify(trophies, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `cyber-trophies-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        function importTrophies() {
            const file = document.getElementById('importFile').files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedTrophies = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedTrophies)) {
                        throw new Error('El archivo no contiene un array válido');
                    }

                    const validTrophies = importedTrophies.filter(trophy => 
                        trophy.title && trophy.difficulty && trophy.date
                    );

                    if (validTrophies.length === 0) {
                        alert('No se encontraron trofeos válidos en el archivo');
                        return;
                    }

                    if (confirm(`¿Quieres importar ${validTrophies.length} trofeos? Esto se añadirá a los existentes.`)) {
                        trophies.push(...validTrophies);
                        saveTrophies();
                        renderTrophies();
                        alert(`Se importaron ${validTrophies.length} trofeos correctamente`);
                    }

                } catch (error) {
                    alert('Error al importar el archivo: ' + error.message);
                }
            };
            reader.readAsText(file);
            
            // Limpiar el input
            document.getElementById('importFile').value = '';
        }

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', function(e) {
            const trophyModal = document.getElementById('trophyModal');
            const detailsModal = document.getElementById('detailsModal');
            
            if (e.target === trophyModal) {
                closeModal();
            }
            if (e.target === detailsModal) {
                closeDetailsModal();
            }
        });

        // Atajos de teclado
        document.addEventListener('keydown', function(e) {
            // ESC para cerrar modales
            if (e.key === 'Escape') {
                if (document.getElementById('writeupPage').style.display === 'block') {
                    closeWriteup();
                } else if (document.getElementById('detailsModal').style.display === 'block') {
                    closeDetailsModal();
                } else if (document.getElementById('trophyModal').style.display === 'block') {
                    closeModal();
                }
            }
            
            // Ctrl + N para nuevo trofeo
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                openAddModal();
            }
            
            // Ctrl + E para exportar
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                exportTrophies();
            }
        });

        // Animación de entrada para las tarjetas
        function animateCards() {
            const cards = document.querySelectorAll('.trophy-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }

        // Llamar animación después de renderizar
        const originalRenderTrophies = renderTrophies;
        renderTrophies = function() {
            originalRenderTrophies();
            setTimeout(animateCards, 50);
        };

        // Datos de ejemplo para demostración
        if (trophies.length === 0) {
            const exampleTrophies = [
                {
                    id: Date.now() + 1,
                    title: "Primera Vulnerabilidad SQL Injection Encontrada",
                    image: "",
                    categories: ["Web Hacking", "Pentesting"],
                    difficulty: "facil",
                    date: "2024-01-15",
                    summary: "Descubrimiento y explotación de una vulnerabilidad SQL injection en una aplicación web de pruebas.",
                    experience: "Aprendí sobre las técnicas básicas de SQL injection, cómo identificar parámetros vulnerables y explotar la base de datos subyacente. Utilizé herramientas como SQLMap y técnicas manuales.",
                    screenshots: []
                },
                {
                    id: Date.now() + 2,
                    title: "Certificación CEH Obtenida",
                    image: "",
                    categories: ["Pentesting"],
                    difficulty: "medio",
                    date: "2024-02-10",
                    summary: "Certificación Certified Ethical Hacker completada con éxito.",
                    experience: "Durante la preparación para CEH, profundice en múltiples áreas de ciberseguridad incluyendo reconocimiento, enumeración, análisis de vulnerabilidades y técnicas de post-explotación.",
                    screenshots: []
                }
            ];
            
            trophies.push(...exampleTrophies);
            saveTrophies();
        }