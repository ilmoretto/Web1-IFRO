document.addEventListener('DOMContentLoaded', function () {
    // Padrões Regex para validação
    const regexPatterns = {
        nome: /^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)+$/,
        cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        rg: /^\d{2}\.\d{3}\.\d{3}-\d{1}$/,
        data: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
        responsavel: /^[A-Za-zÀ-ÿ\s]{2,50}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        telefone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        whatsapp: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        cep: /^\d{5}-\d{3}$/,
        numero: /^[0-9]+$/,
        senha: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/,
        placa: /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/,
        pis: /^\d{3}\.\d{5}\.\d{2}-\d{1}$/,
        cnh: /^\d{11}$/,
        categoriaCnh: /^(A|B|C|D|E|AB|AC|AD|AE)$/i
    };

    // Mensagens de erro personalizadas
    const errorMessages = {
        nome: "Informe um nome e sobrenome.",
        cpf: "CPF deve estar no formato: 123.456.789-10.",
        rg: "RG deve estar no formato: 12.345.678-9. Adicione zeros à esquerda se necessário.",
        data: "Data deve estar no formato: dd/mm/aaaa.",
        responsavel: "Nome do responsável deve conter apenas letras e espaços.",
        email: "Digite um email válido (ex: usuario@dominio.com).",
        telefone: "Telefone deve estar no formato: (11) 99999-9999.",
        whatsapp: "WhatsApp deve estar no formato: (11) 99999-9999.",
        cep: "CEP deve estar no formato: 12345-678.",
        numero: "Digite apenas números.",
        senha: "Senha: mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.",
        confirmaSenha: "As senhas não coincidem.",
        placa: "Placa inválida (formatos: ABC-1234 ou ABC1D23).",
        pis: "PIS/PASEP deve estar no formato: 123.45678.90-1.",
        cnh: "CNH deve conter 11 dígitos.",
        categoriaCnh: "Categoria inválida (ex: A, B, AB)."
    };

    // Mensagens de sucesso
    const successMessages = {
        nome: "Nome válido ✓",
        cpf: "CPF válido ✓",
        rg: "RG válido ✓",
        data: "Data válida ✓",
        responsavel: "Nome válido ✓",
        email: "Email válido ✓",
        telefone: "Telefone válido ✓",
        whatsapp: "WhatsApp válido ✓",
        cep: "CEP válido ✓",
        numero: "Número válido ✓",
        senha: "Senha forte ✓",
        confirmaSenha: "As senhas coincidem ✓",
        placa: "Placa válida ✓",
        pis: "PIS/PASEP válido ✓",
        cnh: "CNH válida ✓",
        categoriaCnh: "Categoria válida ✓"
    };

    // Função para validar um campo específico
    function validateField(fieldName, value) {
        if (!regexPatterns[fieldName]) return false;
        const regex = regexPatterns[fieldName];
        return regex.test(value);
    }

    // Função para mostrar feedback visual
    function showFieldFeedback(fieldName, isValid, value = '', customMessage = null) {
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);

        if (value === '') {
            input.classList.remove('valid', 'invalid');
            errorElement.textContent = '';
            return;
        }

        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            errorElement.textContent = customMessage || successMessages[fieldName];
            errorElement.style.color = '#28a745';
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            errorElement.textContent = customMessage || errorMessages[fieldName];
            errorElement.style.color = '#dc3545';
        }
    }

    // Validações e máscaras específicas
    function validateDate(dateString) {
        if (!regexPatterns.data.test(dateString)) return false;
        const [day, month, year] = dateString.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    function applyMask(maskFunction, event) {
        const input = event.target;
        const originalValue = input.value;
        const cursorPos = input.selectionStart;
        const maskedValue = maskFunction(originalValue);
        input.value = maskedValue;

        // Ajusta a posição do cursor após a máscara
        if (originalValue.length < maskedValue.length) {
            input.setSelectionRange(cursorPos + 1, cursorPos + 1);
        } else {
            input.setSelectionRange(cursorPos, cursorPos);
        }
    }

    const masks = {
        cpf: value => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1'),
        rg: value => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{1})\d+?$/, '$1'),
        telefone: value => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1'),
        whatsapp: value => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1'),
        cep: value => value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1'),
        data: value => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{4})\d+?$/, '$1'),
        pis: value => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3}\.\d{5})(\d)/, '$1.$2').replace(/(\d{3}\.\d{5}\.\d{2})(\d)/, '$1-$2').replace(/(-\d)\d+?$/, '$1'),
    };

    // Adiciona listeners para todos os campos
    const form = document.getElementById('validationForm');
    const inputs = form.querySelectorAll('input');

    inputs.forEach(input => {
        const fieldName = input.id;

        // Listener para input (validação e máscara em tempo real)
        input.addEventListener('input', function (event) {
            // Aplica máscara se existir
            if (masks[fieldName]) {
                applyMask(masks[fieldName], event);
            }

            const value = this.value.trim();
            let isValid = false;

            // Lógica de validação
            if (fieldName === 'data') {
                isValid = validateDate(value);
            } else if (fieldName === 'confirmaSenha') {
                const senha = document.getElementById('senha').value;
                isValid = (value === senha);
            } else if (fieldName === 'senha') {
                isValid = validateField(fieldName, value);
                // Revalida a confirmação de senha
                const confirmaSenhaInput = document.getElementById('confirmaSenha');
                const confirmaSenhaValue = confirmaSenhaInput.value.trim();
                if (confirmaSenhaValue) {
                    const senhasCoincidem = (value === confirmaSenhaValue);
                    showFieldFeedback('confirmaSenha', senhasCoincidem, confirmaSenhaValue);
                }
            } else {
                if (regexPatterns[fieldName]) {
                    isValid = validateField(fieldName, value);
                }
            }
            if (regexPatterns[fieldName] || fieldName === 'confirmaSenha') {
                showFieldFeedback(fieldName, isValid, value);
            }
        });
    });

    // Submit do formulário
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let allValid = true;

        inputs.forEach(input => {
            if (input.style.display !== 'none' && !input.classList.contains('valid')) {
                allValid = false;
                // Força a exibição do erro para campos não preenchidos
                if (input.value.trim() === '' && errorMessages[input.id]) {
                    showFieldFeedback(input.id, false, ' ');
                }
            }
        });

        const resultado = document.getElementById('resultado');
        if (allValid) {
            resultado.className = 'resultado sucesso';
            resultado.innerHTML = `<h3>✅ Formulário enviado com sucesso!</h3>`;
        } else {
            resultado.className = 'resultado erro';
            resultado.innerHTML = `<h3>❌ Corrija os campos em vermelho.</h3>`;
        }
        resultado.scrollIntoView({ behavior: 'smooth' });
    });

    // Botão limpar
    document.getElementById('limpar').addEventListener('click', function () {
        form.reset();
        inputs.forEach(input => {
            const fieldName = input.id;
            input.classList.remove('valid', 'invalid');
            const errorElement = document.getElementById(`${fieldName}-error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
        const resultado = document.getElementById('resultado');
        resultado.className = 'resultado';
        resultado.innerHTML = '';
    });
});